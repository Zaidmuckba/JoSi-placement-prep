'use client';

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  list: {
    marginLeft: 20,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 5,
  },
  highlight: {
    backgroundColor: '#ffeb3b',
  },
  error: {
    color: '#f44336',
  },
  correction: {
    color: '#4caf50',
  },
});

interface ReportProps {
  analysis: {
    percentMatch: number;
    skillsAnalysis: {
      technical: string[];
      soft: string[];
      missing: string[];
    };
    sectionAnalysis: {
      [key: string]: {
        suggestions?: string[];
      };
    };
    suggestions: string[];
  };
}

const ResumeReport = ({ analysis }: ReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Resume Analysis Report</Text>
        
        {/* Overall Match */}
        <Text style={styles.subtitle}>Overall Job Match</Text>
        <Text style={styles.text}>
          Your resume has a {analysis.percentMatch}% match with the job requirements
        </Text>
      </View>

      {/* Skills Analysis */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Skills Analysis</Text>
        
        {analysis.skillsAnalysis.technical.length > 0 && (
          <>
            <Text style={styles.text}>Present Technical Skills:</Text>
            <View style={styles.list}>
              {analysis.skillsAnalysis.technical.map((skill: string, index: number) => (
                <Text key={index} style={styles.listItem}>• {skill}</Text>
              ))}
            </View>
          </>
        )}

        {analysis.skillsAnalysis.soft.length > 0 && (
          <>
            <Text style={styles.text}>Present Soft Skills:</Text>
            <View style={styles.list}>
              {analysis.skillsAnalysis.soft.map((skill: string, index: number) => (
                <Text key={index} style={styles.listItem}>• {skill}</Text>
              ))}
            </View>
          </>
        )}

        {analysis.skillsAnalysis.missing.length > 0 && (
          <>
            <Text style={styles.text}>Missing Skills:</Text>
            <View style={styles.list}>
              {analysis.skillsAnalysis.missing.map((skill: string, index: number) => (
                <Text key={index} style={styles.listItem}>• {skill}</Text>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Section Analysis */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Section Analysis</Text>
        {Object.entries(analysis.sectionAnalysis).map(([section, data]: [string, any]) => (
          data.suggestions && data.suggestions.length > 0 ? (
            <View key={section} style={styles.list}>
              <Text style={styles.text}>{section.charAt(0).toUpperCase() + section.slice(1)}:</Text>
              {data.suggestions.map((suggestion: string, index: number) => (
                <Text key={index} style={styles.listItem}>• {suggestion}</Text>
              ))}
            </View>
          ) : null
        ))}
      </View>

      {/* General Suggestions */}
      {analysis.suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Improvement Suggestions</Text>
          <View style={styles.list}>
            {analysis.suggestions.map((suggestion: string, index: number) => (
              <Text key={index} style={styles.listItem}>• {suggestion}</Text>
            ))}
          </View>
        </View>
      )}
    </Page>
  </Document>
);

export const generatePDFReport = async (analysis: ReportProps['analysis']) => {
  try {
    if (!analysis) {
      throw new Error('Analysis data is required');
    }

    // Validate required fields
    if (typeof analysis.percentMatch !== 'number' ||
        !analysis.skillsAnalysis?.technical ||
        !analysis.skillsAnalysis?.soft ||
        !analysis.skillsAnalysis?.missing ||
        !analysis.sectionAnalysis ||
        !analysis.suggestions) {
      throw new Error('Invalid analysis data structure');
    }

    return await pdf(<ResumeReport analysis={analysis} />).toBlob();
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw new Error('Failed to generate PDF report. Please try again.');
  }
};
