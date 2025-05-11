import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { Feedback } from '../pages/AdminFeedbackDashboard';

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
  feedbacks: Feedback[];
}

const FeedbackSummaryPDF: React.FC<Props> = ({ feedbacks }) => {
  const getFeedbackStats = () => {
    const total = feedbacks.length;
    const feedback = feedbacks.filter(f => f.type === 'feedback').length;
    const suggestions = feedbacks.filter(f => f.type === 'suggestion').length;
    const avgRating = feedbacks
      .filter(f => f.rating)
      .reduce((acc, curr) => acc + (curr.rating || 0), 0) / feedback || 0;

    return { total, feedback, suggestions, avgRating };
  };

  const stats = getFeedbackStats();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>SaloGame Feedback Report</Text>
          <Text style={styles.subtitle}>Generated on {format(new Date(), 'MMMM d, yyyy')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary Statistics</Text>
          <View style={styles.feedbackItem}>
            <Text style={styles.metaText}>Total Feedback Items: {stats.total}</Text>
            <Text style={styles.metaText}>Feedback Entries: {stats.feedback}</Text>
            <Text style={styles.metaText}>Suggestions: {stats.suggestions}</Text>
            <Text style={styles.metaText}>Average Rating: {stats.avgRating.toFixed(1)}/5</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Feedback</Text>
          {feedbacks.slice(0, 10).map((feedback, index) => (
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
                Type: {feedback.type} | Category: {feedback.category} | Status: {feedback.status}
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