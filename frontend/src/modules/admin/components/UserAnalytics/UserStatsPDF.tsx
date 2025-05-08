import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { UserStats } from './userStats';

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
    color: '#666666',
  },
  section: {
    margin: 10,
    padding: 10
  },
  statsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 4
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4
  },
  statValue: {
    fontSize: 20,
    color: '#111827',
    fontWeight: 'bold'
  },
  roleSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    paddingTop: 10
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 4
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

interface UserStatsPDFProps {
  stats: UserStats;
}

const UserStatsPDF: React.FC<UserStatsPDFProps> = ({ stats }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>User Statistics Report</Text>
        <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Total Users</Text>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Active Users</Text>
          <Text style={styles.statValue}>{stats.activeUsers}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Inactive Users</Text>
          <Text style={styles.statValue}>{stats.inactiveUsers}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>New Users This Month</Text>
          <Text style={styles.statValue}>{stats.newUsersThisMonth}</Text>
        </View>
      </View>

      <View style={styles.roleSection}>
        <Text style={[styles.statTitle, { marginBottom: 10 }]}>Users by Role</Text>
        {Object.entries(stats.usersByRole).map(([role, count]) => (
          <View style={styles.roleRow} key={role}>
            <Text>{role}</Text>
            <Text>{count} users ({((count / stats.totalUsers) * 100).toFixed(1)}%)</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        SaloGame User Statistics Report • Confidential
      </Text>
    </Page>
  </Document>
);

export default UserStatsPDF;