import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Interface defining the structure of a feedback item
interface Feedback {
  type: 'feedback' | 'suggestion'; 
  message: string;                  
  rating?: number;                  
  category: string;                 
  isAnonymous: boolean;             
  status: string;                  
  createdAt: string | Date;         
  user?: {                          
    name?: string;                  
    email?: string;                 
  };
}

// PDF document styling using React-PDF StyleSheet
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#6a0dad',
    borderBottomStyle: 'solid',
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    marginBottom: 5,
    color: '#6a0dad',
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 14,
    color: '#666666'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#6a0dad',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    paddingBottom: 5
  },
  feedbackItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f7ff',
    borderRadius: 4
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  feedbackMessage: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 5
  },
  metaText: {
    fontSize: 10,
    color: '#6b7280'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    paddingTop: 10
  }
});

interface Props {
  feedbacks: Feedback[];  // Array of feedback items to be displayed in the report
}

/**
 * Creates SVG paths for a pie chart based on proportional data values
 * @param data Array of objects with value and color properties
 * @param radius Radius of the pie chart
 * @returns Array of objects containing SVG path, color, and percentage for each segment
 */
const createPieChart = (data: { value: number; color: string }[], radius: number) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  return data.map(item => {
    // Calculate the angle for this segment based on its proportion of the total
    const angle = (item.value / total) * 2 * Math.PI;
    
    // Calculate start and end points for the arc
    const x1 = radius * Math.cos(currentAngle);
    const y1 = radius * Math.sin(currentAngle);
    const x2 = radius * Math.cos(currentAngle + angle);
    const y2 = radius * Math.sin(currentAngle + angle);
    
    // Create SVG path for this pie segment
    // The 'large-arc-flag' (4th parameter in A) is 1 if angle > 180 degrees
    const path = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${angle > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`;
    currentAngle += angle;
    
    return { 
      path, 
      color: item.color, 
      percentage: (item.value / total * 100).toFixed(1) 
    };
  });
};

const FeedbackSummaryPDF: React.FC<Props> = ({ feedbacks }) => {
  /**
   * Calculates statistics from feedback data including:
   * - Category distribution
   * - Overall totals
   * - Average ratings
   */
  const getFeedbackStats = () => {
    // Standard categories used in the feedback system
    const categories = ['general', 'service', 'facility', 'games', 'events'];
    
    // Generate statistics for each category
    const categoryData = categories.map(category => ({
      name: category,
      feedback: feedbacks.filter(f => f.type === 'feedback' && f.category === category).length,
      suggestions: feedbacks.filter(f => f.type === 'suggestion' && f.category === category).length
    }));
    
    return {
      total: feedbacks.length,
      categoryData,
      avgRating: feedbacks
        .filter(f => f.rating)
        .reduce((acc, curr) => acc + (curr.rating || 0), 0) / feedbacks.filter(f => f.rating).length || 0
    };
  };

  const stats = getFeedbackStats();
  
  // Color palette for the pie chart segments
  const colors = ['#6a0dad', '#34d399', '#f59e0b', '#3b82f6', '#ef4444'];
  
  // Prepare separate data for feedback and suggestions pie charts
  const feedbackPieData = stats.categoryData.map((item, index) => ({
    value: item.feedback,
    color: colors[index]
  }));

  const suggestionPieData = stats.categoryData.map((item, index) => ({
    value: item.suggestions,
    color: colors[index]
  }));
  
  // Generate separate SVG paths for feedback and suggestion pie charts
  const feedbackPiePaths = createPieChart(feedbackPieData, 50);
  const suggestionPiePaths = createPieChart(suggestionPieData, 50);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>SaloGame Feedback Report</Text>
          <Text style={styles.subtitle}>Generated on {format(new Date(), 'MMMM d, yyyy')}</Text>
        </View>

        {/* Summary statistics section showing overall metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary Statistics</Text>
          <View style={styles.feedbackItem}>
            <Text style={styles.metaText}>Total Feedback Items: {stats.total}</Text>
            <Text style={styles.metaText}>Feedback Entries: {
              feedbacks.filter(f => f.type === 'feedback').length
            }</Text>
            <Text style={styles.metaText}>Suggestions: {
              feedbacks.filter(f => f.type === 'suggestion').length
            }</Text>
            <Text style={styles.metaText}>Average Rating: {stats.avgRating.toFixed(1)}/5</Text>
          </View>
        </View>

        {/* Pie Charts Section with separate visualizations for feedback and suggestions */}
        <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between' }]}>
          {/* Feedback Distribution */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>Feedback Distribution</Text>
            {/* SVG pie chart for feedback data */}
            <Svg viewBox="-60 -60 120 120" width={120} height={120}>
              {feedbackPiePaths.map((path, index) => (
                <Path key={index} d={path.path} fill={path.color} />
              ))}
            </Svg>
            {/* Legend for feedback pie chart */}
            <View style={{ marginTop: 10 }}>
              {stats.categoryData.map((category, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', margin: 2 }}>
                  {/* Color indicator for the category */}
                  <View style={{ width: 8, height: 8, backgroundColor: colors[index], marginRight: 5 }} />
                  <Text style={[styles.metaText, { fontSize: 8 }]}>
                    {/* Category name (capitalized) and percentage */}
                    {category.name.charAt(0).toUpperCase() + category.name.slice(1)}: {feedbackPiePaths[index].percentage}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Suggestions Distribution */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>Suggestions Distribution</Text>
            {/* SVG pie chart for suggestion data */}
            <Svg viewBox="-60 -60 120 120" width={120} height={120}>
              {suggestionPiePaths.map((path, index) => (
                <Path key={index} d={path.path} fill={path.color} />
              ))}
            </Svg>
            {/* Legend for suggestions pie chart */}
            <View style={{ marginTop: 10 }}>
              {stats.categoryData.map((category, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', margin: 2 }}>
                  {/* Color indicator for the category */}
                  <View style={{ width: 8, height: 8, backgroundColor: colors[index], marginRight: 5 }} />
                  <Text style={[styles.metaText, { fontSize: 8 }]}>
                    {/* Category name (capitalized) and percentage */}
                    {category.name.charAt(0).toUpperCase() + category.name.slice(1)}: {suggestionPiePaths[index].percentage}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Suggestions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Suggestions</Text>
          {feedbacks
            .filter(f => f.type === 'suggestion')
            .slice(0, 10)
            .map((feedback, index) => (
              <View key={index} style={styles.feedbackItem}>
                <View style={styles.feedbackHeader}>
                  <Text style={styles.metaText}>
                    {feedback.isAnonymous ? 'Anonymous User' : feedback.user?.name || feedback.user?.email}
                  </Text>
                  <Text style={styles.metaText}>
                    {format(new Date(feedback.createdAt), 'MMM dd, yyyy')}
                  </Text>
                </View>
                <Text style={styles.feedbackMessage}>{feedback.message}</Text>
                <Text style={styles.metaText}>
                  Category: {feedback.category} | Status: {feedback.status}
                </Text>
              </View>
          ))}
        </View>

        <Text style={styles.footer}>
          SaloGame Feedback Report • Confidential
        </Text>
      </Page>
    </Document>
  );
};

export default FeedbackSummaryPDF;