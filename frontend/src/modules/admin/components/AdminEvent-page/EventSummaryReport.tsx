import {useEffect} from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Svg, Path, Circle, G } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#6a0dad', // SaloGames purple theme
    borderBottomStyle: 'solid',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    marginBottom: 5,
    color: '#6a0dad', // SaloGames purple theme
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
  },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderRadius: 4,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#6a0dad', // SaloGames purple theme
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    paddingBottom: 5,
  },
  eventCard: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f7ff', // Light purple background
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#6a0dad', // SaloGames purple theme
    borderLeftStyle: 'solid',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  eventType: {
    fontSize: 12,
    padding: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    color: '#6a0dad',
  },
  eventDetail: {
    marginBottom: 5,
    fontSize: 12,
    flexDirection: 'row',
  },
  eventLabel: {
    width: 120,
    fontWeight: 'bold',
    color: '#555555',
  },
  eventValue: {
    flex: 1,
    color: '#111827',
  },
  participantsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
  },
  statsItem: {
    width: '30%',
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsLabel: {
    fontSize: 10,
    color: '#555555',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    paddingTop: 10,
    borderTopColor: '#e5e7eb',
  },
  progressBar: {
    height: 10,
    marginTop: 5,
    borderRadius: 5,
    backgroundColor: '#e5e7eb',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#6a0dad',
  },
  chartSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555555',
    marginBottom: 5,
  },
  chartContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  noDataMsg: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 10,
  },
});

// Helper function to format dates consistently
const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
};

// Get status badge color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'in_progress': return '#10B981'; // green
    case 'completed': return '#6366F1';  // indigo
    case 'paused': return '#F59E0B';     // amber
    case 'not_started': 
    default: return '#9CA3AF';  // gray
  }
};

interface EventSummaryReportProps {
  events: any[];
  teams: any[];
  analytics: any;
  onLoadComplete?: () => void;
}

const EventSummaryReport: React.FC<EventSummaryReportProps> = ({ events, teams, analytics, onLoadComplete }) => {
  const currentDate = new Date();
  
  // Format trend data for chart
  const participationTrend = analytics.participationTrend || [];
  const maxValue = Math.max(...participationTrend.map((p: any) => p.participants), 1);
  
  // Generate trend line path
  const generateTrendPath = () => {
    if (participationTrend.length === 0) return '';
    
    const points = participationTrend.map((point: any, index: number) => {
      const x = 30 + (index * (450 / (participationTrend.length - 1 || 1)));
      const y = 150 - ((point.participants / maxValue) * 120);
      return [x, y];
    });
    
    return points.map((point: number[], index: number) => 
      `${index === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`
    ).join(' ');
  };
  useEffect(() => {
    // Add a slight delay to ensure PDF has time to render
    const timer = setTimeout(() => {
      if (onLoadComplete) onLoadComplete();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [onLoadComplete]);


  return (
    <PDFViewer style={{ width: '100%', height: '100%' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>SaloGame Events Report</Text>
              <Text style={styles.subtitle}>
                Generated on {format(currentDate, 'MMMM d, yyyy')}
              </Text>
            </View>
            {/* Logo placeholder */}
            <View style={{ width: 80 }}>
              <Text style={{ fontSize: 20, color: '#6a0dad', fontWeight: 'bold' }}>SALO</Text>
              <Text style={{ fontSize: 12, color: '#6a0dad' }}>GAMES</Text>
            </View>
          </View>

          {/* Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Analytics</Text>
            
            {/* Statistics */}
            <View style={styles.participantsStats}>
              <View style={styles.statsItem}>
                <Text style={styles.statsValue}>{analytics.totalEvents}</Text>
                <Text style={styles.statsLabel}>Total Events</Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsValue}>{analytics.totalParticipants}</Text>
                <Text style={styles.statsLabel}>Total Participants</Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsValue}>{analytics.verificationRate.toFixed(1)}%</Text>
                <Text style={styles.statsLabel}>Verification Rate</Text>
              </View>
            </View>
            
            {/* Distribution */}
            <View style={[styles.participantsStats, { marginTop: 20 }]}>
              <View style={styles.statsItem}>
                <Text style={styles.statsValue}>{analytics.teamEvents}</Text>
                <Text style={styles.statsLabel}>Team Events</Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsValue}>{analytics.singleEvents}</Text>
                <Text style={styles.statsLabel}>Single Events</Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsValue}>{teams.length}</Text>
                <Text style={styles.statsLabel}>Total Teams</Text>
              </View>
            </View>
            
            {/* Participation distribution */}
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Participation Distribution</Text>
              <View style={styles.eventDetail}>
                <Text style={styles.eventLabel}>Team Participants:</Text>
                <Text style={styles.eventValue}>{analytics.teamParticipants} ({Math.round((analytics.teamParticipants / analytics.totalParticipants) * 100)}%)</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(analytics.teamParticipants / analytics.totalParticipants) * 100}%` }]} />
              </View>
              
              <View style={[styles.eventDetail, { marginTop: 10 }]}>
                <Text style={styles.eventLabel}>Solo Participants:</Text>
                <Text style={styles.eventValue}>{analytics.soloParticipants} ({Math.round((analytics.soloParticipants / analytics.totalParticipants) * 100)}%)</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(analytics.soloParticipants / analytics.totalParticipants) * 100}%` }]} />
              </View>
            </View>
            
            {/* Participation Trend Chart */}
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Participation Trend (Last 30 Days)</Text>
              
              {participationTrend.length > 0 ? (
                <View style={styles.chartContainer}>
                  <Svg width="100%" height="180">
                    {/* X and Y axis */}
                    <Path d="M 30 150 H 480" stroke="#e5e7eb" strokeWidth={1} />
                    <Path d="M 30 30 V 150" stroke="#e5e7eb" strokeWidth={1} />
                    
                    {/* Trend line */}
                    <Path
                      d={generateTrendPath()}
                      stroke="#6a0dad"
                      strokeWidth={2}
                      fill="none"
                    />
                    
                    {/* Data points */}
                    {participationTrend.map((point: any, index: number) => {
                      const x = 30 + (index * (450 / (participationTrend.length - 1 || 1)));
                      const y = 150 - ((point.participants / maxValue) * 120);
                      return (
                        <Circle key={index} cx={x} cy={y} r={3} fill="#6a0dad" />
                      );
                    })}
                    
                    {/* Y-axis labels */}
                    {[0, Math.round(maxValue / 2), maxValue].map((value, index) => (
                      <Text
                        key={index}
                        x={20}
                        y={150 - (index * 60)}
                        style={{ fontSize: 8, textAlign: 'right' }}
                      >
                        {value}
                      </Text>
                    ))}
                  </Svg>
                </View>
              ) : (
                <Text style={styles.noDataMsg}>No trend data available</Text>
              )}
            </View>
          </View>

          {/* Event Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Details</Text>
            
            {events.length > 0 ? (
              events.map((event, index) => (
                <View key={index} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.eventName}</Text>
                    <Text style={styles.eventType}>{event.category === 'team-battle' ? 'Team Battle' : 'Single Battle'}</Text>
                  </View>
                  
                  <View style={styles.eventDetail}>
                    <Text style={styles.eventLabel}>Start Date:</Text>
                    <Text style={styles.eventValue}>{formatDate(event.startDateTime)}</Text>
                  </View>
                  
                  <View style={styles.eventDetail}>
                    <Text style={styles.eventLabel}>End Date:</Text>
                    <Text style={styles.eventValue}>{formatDate(event.endDateTime)}</Text>
                  </View>
                  
                  <View style={styles.eventDetail}>
                    <Text style={styles.eventLabel}>Status:</Text>
                    <Text style={[styles.eventValue, { color: getStatusColor(event.status || 'not_started') }]}>
                      {event.status ? event.status.replace('_', ' ').toUpperCase() : 'NOT STARTED'}
                    </Text>
                  </View>
                  
                  {event.category === 'team-battle' ? (
                    <View style={styles.eventDetail}>
                      <Text style={styles.eventLabel}>Teams Registered:</Text>
                      <Text style={styles.eventValue}>{event.registeredTeams?.length || 0}</Text>
                    </View>
                  ) : (
                    <View style={styles.eventDetail}>
                      <Text style={styles.eventLabel}>Participants:</Text>
                      <Text style={styles.eventValue}>{event.registeredEmails?.length || 0}</Text>
                    </View>
                  )}
                  
                  <View style={styles.eventDetail}>
                    <Text style={styles.eventLabel}>Description:</Text>
                    <Text style={styles.eventValue}>{event.description || 'No description provided'}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataMsg}>No events found</Text>
            )}
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            SaloGames Event Report • Confidential • Internal Use Only
          </Text>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default EventSummaryReport;