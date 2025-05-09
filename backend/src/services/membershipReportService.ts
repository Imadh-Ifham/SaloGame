import PDFDocument from "pdfkit";
import Subscription from "../models/subscription.model";

// Define interface for growth data item
interface GrowthDataItem {
  month: string;
  count: number;
}

// Define report section interface
interface ReportSection {
  id: string;
  title: string;
  description: string;
}

/**
 * Generate subscription report data based on period and selected sections
 */
export async function generateSubscriptionReport(
  period: string,
  selectedSections: string[]
): Promise<any> {
  // Convert period to date range
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "7days":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30days":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90days":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "180days":
      startDate.setDate(startDate.getDate() - 180);
      break;
    case "1year":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30); // Default to 30 days
  }

  // Get subscription summary
  const totalActiveMembers = await Subscription.countDocuments({
    status: "active",
  });

  const totalRevenue = await Subscription.aggregate([
    { $match: { status: "active" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  const autoRenewalUsers = await Subscription.countDocuments({
    status: "active",
    autoRenew: true,
  });

  const failedPayments = await Subscription.countDocuments({
    renewalAttempted: true,
    renewalSuccessful: false,
    status: "active",
    autoRenew: true,
  });

  // Get membership plan distribution
  const membershipDistribution = await Subscription.aggregate([
    { $match: { status: "active" } },
    {
      $group: {
        _id: "$membershipId",
        count: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    {
      $lookup: {
        from: "membershiptypes",
        localField: "_id",
        foreignField: "_id",
        as: "membership",
      },
    },
    { $unwind: "$membership" },
    {
      $project: {
        name: "$membership.name",
        count: 1,
        revenue: 1,
        percentage: {
          $multiply: [{ $divide: ["$count", totalActiveMembers] }, 100],
        },
      },
    },
  ]);

  // Get subscription growth data
  let growthData: GrowthDataItem[] = [];
  if (selectedSections.includes("subscription-summary")) {
    const lastSixMonths = new Date();
    lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);

    const aggregationResult = await Subscription.aggregate([
      { $match: { createdAt: { $gte: lastSixMonths } } },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    growthData = aggregationResult.map((data) => ({
      month: new Date(2024, data._id - 1, 1).toLocaleString("default", {
        month: "short",
      }),
      count: data.count,
    }));
  }

  // Get renewal statistics if requested
  let renewalStats = null;
  if (selectedSections.includes("renewal-analysis")) {
    const totalCompletedRenewals = await Subscription.countDocuments({
      renewalCompleted: true,
      renewalCompletedAt: { $gte: startDate, $lte: endDate },
    });

    const totalRenewalAttempts = await Subscription.countDocuments({
      renewalAttempted: true,
      lastRenewalAttempt: { $gte: startDate, $lte: endDate },
    });

    const renewalRate =
      totalRenewalAttempts > 0
        ? (totalCompletedRenewals / totalRenewalAttempts) * 100
        : 0;

    renewalStats = {
      totalRenewalAttempts,
      totalCompletedRenewals,
      renewalRate,
      autoRenewalUsers,
    };
  }

  // Return combined report data
  return {
    period,
    generatedAt: new Date(),
    summary: {
      totalActiveMembers,
      totalRevenue: totalRevenue[0]?.total || 0,
      autoRenewalUsers,
      failedPayments,
    },
    membershipDistribution,
    growthData,
    renewalStats,
    selectedSections,
  };
}

/**
 * Generate PDF buffer from report data
 */
// Modify the generatePDF function to add page numbers and enhanced header/footer
/**
 * Generate PDF buffer from report data
 */
export async function generatePDF(reportData: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        margin: 50,
        bufferPages: true,
        info: {
          Title: "SaloGame Membership Report",
          Author: "SaloGame System",
          Subject: "Membership Analytics",
          Keywords: "membership, subscriptions, revenue, analytics",
          Creator: "SaloGame Admin System",
        },
        // Don't auto-create first page, we'll manage pages explicitly
        autoFirstPage: false,
      });

      // Collect PDF data chunks
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Create first page explicitly
      doc.addPage();
      addHeader(doc, reportData);

      // Add period information in a styled box
      doc
        .moveDown(2)
        .rect(52, 140, doc.page.width - 104, 40)
        .fill("#f3f4f6");

      doc
        .rect(50, 142, doc.page.width - 100, 40)
        .fillAndStroke("#f3f4f6", "#e5e7eb");

      const periodText = getPeriodLabel(reportData.period);
      doc
        .fontSize(12)
        .fillColor("#374151")
        .text(`Report Period: ${periodText}`, 70, 150)
        .text(
          `Generated on: ${reportData.generatedAt.toLocaleString()}`,
          doc.page.width / 2,
          150,
          { align: "right" }
        );

      // Track current y position for content flow
      let yPosition = 200;

      // Add sections based on selection using our improved content flow management
      if (reportData.selectedSections.includes("subscription-summary")) {
        yPosition = addContentWithPageBreaks(
          doc,
          "Subscription Summary",
          yPosition,
          () => addSubscriptionSummary(doc, reportData)
        );
      }

      if (reportData.selectedSections.includes("revenue-breakdown")) {
        yPosition = addContentWithPageBreaks(
          doc,
          "Revenue Breakdown",
          yPosition + 20,
          () => addRevenueBreakdown(doc, reportData)
        );
      }

      if (
        reportData.selectedSections.includes("renewal-analysis") &&
        reportData.renewalStats
      ) {
        yPosition = addContentWithPageBreaks(
          doc,
          "Renewal Analysis",
          yPosition + 20,
          () => addRenewalAnalysis(doc, reportData)
        );
      }

      // Add footers to all pages AFTER all content is added
      const pageCount = doc.bufferedPageRange().count;

      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        addFooter(doc, i + 1, pageCount);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// New unified function for handling content with proper page breaks
function addContentWithPageBreaks(
  doc: PDFKit.PDFDocument,
  title: string,
  yPosition: number,
  contentFn: Function
): number {
  // Check remaining space on current page
  const remainingSpace = doc.page.height - 100 - yPosition;

  // Estimate if we need a new page (minimum 150 pixels for a section)
  // This is just initial placement - actual content might still require page breaks
  if (remainingSpace < 150) {
    doc.addPage();
    addHeader(doc, null);
    yPosition = 140; // Reset position after header on new page
  }

  const startY = yPosition;

  // Add section title
  doc.fontSize(16).fillColor("#6a0dad").text(title, 50, startY);

  // Draw underline
  doc
    .moveTo(50, startY + 25)
    .lineTo(doc.page.width - 50, startY + 25)
    .stroke("#e5e7eb");

  // Move position for content
  doc.y = startY + 35;

  // Before running the content function, save the current page
  const startPage =
    doc.bufferedPageRange().start + doc.bufferedPageRange().count - 1;

  // Execute the content function
  contentFn();

  // Get ending position and draw border around the section
  const endY = doc.y;
  const endPage =
    doc.bufferedPageRange().start + doc.bufferedPageRange().count - 1;

  // If we're still on the same page, draw a border around the section
  if (startPage === endPage) {
    doc
      .rect(40, startY - 10, doc.page.width - 80, endY - startY + 20)
      .stroke("#e5e7eb");
  }

  return endY;
}
// Function to add header to every page
function addHeader(doc: PDFKit.PDFDocument, reportData: any) {
  // Add header with logo and gradient background
  doc.rect(50, 50, doc.page.width - 100, 70).fillAndStroke(
    "#f9f7ff", // Replace gradient with solid color
    "#e5e7eb"
  );

  // Add SALO GAMES logo placeholder
  doc
    .fontSize(20)
    .fillColor("#6a0dad")
    .text("SALO", doc.page.width - 120, 65, { align: "right" })
    .fontSize(12)
    .text("GAMES", doc.page.width - 120, 90, { align: "right" });

  // Add report title
  doc
    .fontSize(24)
    .fillColor("#6a0dad")
    .text("Membership Report", 70, 65)
    .fontSize(12)
    .fillColor("#777777")
    .text("Subscription & Revenue Analysis", 70, 95);
}

// Function to add footer with page numbers
function addFooter(
  doc: PDFKit.PDFDocument,
  currentPage: number,
  totalPages: number
) {
  const footerY = doc.page.height - 50;

  // Add dividing line
  doc
    .moveTo(50, footerY)
    .lineTo(doc.page.width - 50, footerY)
    .stroke("#e5e7eb");

  // Add footer text
  doc
    .fontSize(10)
    .fillColor("#6b7280")
    .text(
      `Generated on ${new Date().toLocaleDateString()} • SaloGames Membership Report • Confidential`,
      50,
      footerY + 10,
      { align: "center" }
    );

  // Add page numbers
  doc
    .fontSize(10)
    .fillColor("#6b7280")
    .text(`Page ${currentPage} of ${totalPages}`, 50, footerY + 10, {
      align: "right",
    });
}

// Add section with a box around content
function addSectionBox(
  doc: PDFKit.PDFDocument,
  title: string,
  yPosition: number,
  contentFn: Function
): number {
  const minContentHeight = 150; // Minimum estimated content height
  const remainingSpace = doc.page.height - 100 - yPosition;

  if (remainingSpace < minContentHeight) {
    doc.addPage();

    // Add header to the new page
    addHeader(doc, null);

    yPosition = 140; // Set consistent Y position after header
  }
  const startY = yPosition;

  // Draw section title
  doc.fontSize(16).fillColor("#6a0dad").text(title, 50, startY);

  // Draw underline
  doc
    .moveTo(50, startY + 25)
    .lineTo(doc.page.width - 50, startY + 25)
    .stroke("#e5e7eb");

  // Move position for content
  doc.y = startY + 35;

  // Call the function to add content
  contentFn();

  // Get the new Y position after content
  const endY = doc.y;

  // Draw the border around the section
  doc
    .rect(40, startY - 10, doc.page.width - 80, endY - startY + 20)
    .stroke("#e5e7eb");

  return endY;
}

// Helper function to get period label
function getPeriodLabel(period: string): string {
  switch (period) {
    case "7days":
      return "Last 7 Days";
    case "30days":
      return "Last 30 Days";
    case "90days":
      return "Last 3 Months";
    case "180days":
      return "Last 6 Months";
    case "1year":
      return "Last Year";
    default:
      return "Last 30 Days";
  }
}

// Helper function to add subscription summary section to PDF
function addSubscriptionSummary(doc: PDFKit.PDFDocument, reportData: any) {
  const metricsPerRow = 2;
  const metricWidth = (doc.page.width - 120) / metricsPerRow;
  const metrics = [
    {
      title: "Total Active Members",
      value: reportData.summary.totalActiveMembers.toString(),
    },
    {
      title: "Total Revenue",
      value: `LKR ${reportData.summary.totalRevenue.toFixed(2)}`,
    },
    {
      title: "Auto-Renewal Users",
      value: reportData.summary.autoRenewalUsers.toString(),
    },
    {
      title: "Failed Payments",
      value: reportData.summary.failedPayments.toString(),
    },
  ];

  // Draw metrics in a grid
  let rowY = doc.y;
  metrics.forEach((metric, index) => {
    const row = Math.floor(index / metricsPerRow);
    const col = index % metricsPerRow;

    if (col === 0 && index > 0) {
      rowY += 80; // Increase spacing between rows
    }

    const x = 60 + col * metricWidth;
    const y = rowY;

    // Draw metric card with gradient background
    doc.rect(x, y, metricWidth - 20, 60).fillAndStroke("#f9f7ff", "#e5e7eb");

    // Add left border in purple
    doc.rect(x, y, 3, 60).fill("#6a0dad");

    // Add content
    doc
      .fontSize(10)
      .fillColor("#555555")
      .text(metric.title, x + 10, y + 10);

    doc
      .fontSize(16)
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .text(metric.value, x + 10, y + 30);
  });

  // Update the y position to after the metrics grid
  doc.y = rowY + 80;

  // Add growth chart data if available
  if (reportData.growthData && reportData.growthData.length > 0) {
    const neededHeight = 200; // Approximate height for growth chart
    const remainingSpace = doc.page.height - 100 - doc.y;

    if (remainingSpace < neededHeight) {
      // Add a new page with proper header
      doc.addPage();
      addHeader(doc, null);
      doc.y = 140; // Consistent Y position
    }

    doc
      .fontSize(14)
      .fillColor("#374151")
      .text("Subscription Growth", { underline: true })
      .moveDown();

    const growthData = reportData.growthData;

    // Draw bar chart
    const chartHeight = 140;
    const chartWidth = 390;
    const barSpacing = 15;
    const barWidth =
      (chartWidth - (growthData.length + 1) * barSpacing) / growthData.length;
    const chartStartY = doc.y;
    const chartStartX = 80;

    // Get maximum value for scaling
    const maxValue = Math.max(
      ...growthData.map((d: GrowthDataItem) => d.count),
      1
    );

    // Draw chart background and axes
    doc.rect(chartStartX, chartStartY, chartWidth, chartHeight).fill("#f9f7ff");

    // Draw horizontal gridlines
    for (let i = 0; i <= 4; i++) {
      const y = chartStartY + chartHeight - (i * chartHeight) / 4;
      doc
        .moveTo(chartStartX, y)
        .lineTo(chartStartX + chartWidth, y)
        .stroke("#e5e7eb");

      // Add y-axis labels
      doc
        .fontSize(8)
        .fillColor("#6b7280")
        .text(
          Math.round((maxValue * i) / 4).toString(),
          chartStartX - 20,
          y - 4,
          { width: 18, align: "right" }
        );
    }

    // Draw bars
    growthData.forEach((data: GrowthDataItem, index: number) => {
      const x = chartStartX + barSpacing + index * (barWidth + barSpacing);
      const barHeight = (data.count / maxValue) * (chartHeight - 20);
      const y = chartStartY + chartHeight - barHeight - 10;

      // Draw bar with gradient
      doc.rect(x, y, barWidth, barHeight).fillAndStroke("#6a0dad", "#6a0dad");

      // Add month label
      doc
        .fontSize(8)
        .fillColor("#374151")
        .text(data.month, x - 2, chartStartY + chartHeight + 5, {
          width: barWidth + 4,
          align: "center",
        });

      // Add value on top of bar if there's enough space
      if (barHeight > 20) {
        doc
          .fontSize(8)
          .fillColor("#ffffff")
          .text(data.count.toString(), x, y + 5, {
            width: barWidth,
            align: "center",
          });
      }
    });

    // Update y position
    doc.y = chartStartY + chartHeight + 25;

    // Add a legend/summary
    const growthTotal = growthData.reduce(
      (sum: number, item: GrowthDataItem) => sum + item.count,
      0
    );
    const latestMonth = growthData[growthData.length - 1]?.month || "N/A";
    const latestCount = growthData[growthData.length - 1]?.count || 0;

    doc
      .fontSize(10)
      .fillColor("#374151")
      .text(`Total new subscriptions in period: ${growthTotal}`, {
        continued: false,
      })
      .text(`Latest month (${latestMonth}): ${latestCount} new subscriptions`, {
        continued: false,
      });

    doc.moveDown(2);
  }
}

// Helper function to add revenue breakdown section to PDF
// Update the revenue breakdown function
function addRevenueBreakdown(doc: PDFKit.PDFDocument, reportData: any) {
  if (
    reportData.membershipDistribution &&
    reportData.membershipDistribution.length > 0
  ) {
    doc
      .fontSize(14)
      .fillColor("#374151")
      .text("Revenue by Membership Type")
      .moveDown();

    // Assign colors to each membership type
    const chartColors = [
      "#6a0dad",
      "#34d399",
      "#f59e0b",
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#6366f1",
      "#8b5cf6",
    ];
    const distributionWithColors = reportData.membershipDistribution.map(
      (item: any, index: number) => ({
        ...item,
        color: chartColors[index % chartColors.length],
      })
    );

    // Create pie chart data
    const pieData = distributionWithColors.map((item: any) => ({
      name: item.name,
      value: item.revenue,
      color: item.color,
    }));

    const radius = 50;
    const piePaths = createPieChart(pieData, radius);

    // Draw pie chart
    if (piePaths.length > 0) {
      // Create a row for the chart and legend
      const chartStartY = doc.y;

      // Add the pie chart
      doc.save();
      doc.translate(120, chartStartY + radius + 10);

      piePaths.forEach((path: any) => {
        doc.path(path.path).fillAndStroke(path.color, "#FFFFFF");
      });

      doc.restore();

      // Add legend
      doc.y = chartStartY;
      doc.x = 240;

      distributionWithColors.forEach((item: any, index: number) => {
        if (index > 0 && index % 3 === 0) {
          doc.y += 15;
          doc.x = 240;
        }
        // Draw color square
        doc.rect(doc.x, doc.y, 10, 10).fill(item.color);

        // Add text
        doc
          .fontSize(8)
          .fillColor("#374151")
          .text(
            `${item.name} (${piePaths[index]?.percentage || 0}%)`,
            doc.x + 12,
            doc.y - 8,
            { width: 100 }
          );

        if (index % 3 !== 2) {
          doc.x += 110; // Move to next column if not end of row
        } else {
          doc.y += 15; // Otherwise move to next row
          doc.x = 240; // Reset x position
        }
      });

      // Update y position to after the chart
      doc.y = Math.max(doc.y, chartStartY + 2 * radius + 30);

      if (
        doc.y + reportData.membershipDistribution.length * 25 + 50 >
        doc.page.height - 100
      ) {
        doc.addPage();
        addHeader(doc, reportData);
        doc.y = 140; // Set y position after header
      }
    }

    // Create a table for membership distribution
    const tableTop = doc.y + 20;
    const colWidths = [150, 80, 80, 80];
    const tableWidth = colWidths.reduce((sum, w) => sum + w, 0);

    // Draw table header
    doc.rect(60, tableTop, tableWidth, 25).fill("#f3f4f6");

    doc
      .fontSize(10)
      .fillColor("#374151")
      .text("Membership Type", 70, tableTop + 8, { width: colWidths[0] })
      .text("Subscribers", 70 + colWidths[0], tableTop + 8, {
        width: colWidths[1],
      })
      .text("Percentage", 70 + colWidths[0] + colWidths[1], tableTop + 8, {
        width: colWidths[2],
      })
      .text(
        "Revenue",
        70 + colWidths[0] + colWidths[1] + colWidths[2],
        tableTop + 8,
        { width: colWidths[3] }
      );

    // Draw table rows with colored squares matching pie chart
    distributionWithColors.forEach((item: any, index: number) => {
      const rowY = tableTop + 25 + index * 25;

      // Add zebra striping
      if (index % 2 === 1) {
        doc.rect(60, rowY, tableWidth, 25).fill("#f9f9f9");
      }

      // Add border
      doc.rect(60, rowY, tableWidth, 25).stroke("#e5e7eb");

      // Add color indicator
      doc.rect(65, rowY + 8, 8, 8).fill(item.color);

      // Add data
      doc
        .fontSize(10)
        .fillColor("#111827")
        .text(item.name, 80, rowY + 8, { width: colWidths[0] - 10 })
        .text(item.count.toString(), 70 + colWidths[0], rowY + 8, {
          width: colWidths[1],
        })
        .text(
          `${item.percentage.toFixed(1)}%`,
          70 + colWidths[0] + colWidths[1],
          rowY + 8,
          { width: colWidths[2] }
        )
        .text(
          `LKR ${item.revenue.toFixed(2)}`,
          70 + colWidths[0] + colWidths[1] + colWidths[2],
          rowY + 8,
          { width: colWidths[3] }
        );
    });

    // Update y position
    doc.y = tableTop + 25 + reportData.membershipDistribution.length * 25 + 10;
  } else {
    doc
      .fontSize(12)
      .fillColor("#6b7280")
      .text("Revenue breakdown is not available for the selected period.")
      .moveDown();
  }
}

// Add renewal analysis section to PDF
function addRenewalAnalysis(doc: PDFKit.PDFDocument, reportData: any) {
  if (reportData.renewalStats) {
    const metrics = [
      {
        title: "Auto-Renewal Users",
        value: reportData.renewalStats.autoRenewalUsers.toString(),
        color: "#6a0dad",
      },
      {
        title: "Total Renewal Attempts",
        value: reportData.renewalStats.totalRenewalAttempts.toString(),
        color: "#3b82f6",
      },
      {
        title: "Successful Renewals",
        value: reportData.renewalStats.totalCompletedRenewals.toString(),
        color: "#10b981",
      },
      {
        title: "Renewal Success Rate",
        value: `${reportData.renewalStats.renewalRate.toFixed(1)}%`,
        color:
          reportData.renewalStats.renewalRate > 90
            ? "#10b981"
            : reportData.renewalStats.renewalRate > 70
            ? "#f59e0b"
            : "#ef4444",
      },
    ];

    const metricWidth = (doc.page.width - 120) / 2;

    // Draw metrics in a grid
    metrics.forEach((metric, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 60 + col * metricWidth;
      const y = doc.y + row * 60;

      // Draw metric card
      doc.rect(x, y, metricWidth - 20, 50).fillAndStroke("#f9f7ff", "#e5e7eb");

      // Add left border in metric color
      doc.rect(x, y, 3, 50).fill(metric.color);

      // Add content
      doc
        .fontSize(10)
        .fillColor("#555555")
        .text(metric.title, x + 10, y + 10);

      doc
        .fontSize(16)
        .fillColor("#111827")
        .text(metric.value, x + 10, y + 30);
    });

    // Update y position
    doc.y = doc.y + Math.ceil(metrics.length / 2) * 60 + 10;
  } else {
    doc
      .fontSize(12)
      .fillColor("#6b7280")
      .text("Renewal analysis is not available for the selected period.")
      .moveDown();
  }
}

// Add this function to create pie charts
function createPieChart(
  data: { name: string; value: number; color: string }[],
  radius: number
) {
  if (!data || data.length === 0) {
    return []; // Return empty array for empty data
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  if (total === 0) {
    return []; // Return empty array if total is zero
  }

  let startAngle = 0;

  return data.map((item) => {
    const value = item.value || 0;
    const angle = (value / total) * 360;
    const endAngle = startAngle + angle;

    // Calculate path coordinates
    const x1 = radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = radius * Math.sin((endAngle * Math.PI) / 180);

    // Create SVG path
    const largeArcFlag = angle > 180 ? 1 : 0;
    const path = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    const result = {
      path,
      color: item.color,
      value: value,
      percentage: ((value / total) * 100).toFixed(1),
    };

    startAngle = endAngle;
    return result;
  });
}
