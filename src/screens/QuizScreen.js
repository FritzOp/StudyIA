import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shadows } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { AnimatedEntrance, AnimatedPressable } from '../components/AnimatedContainer';

const sampleQuiz = {
  subject: 'Inteligencia Artificial',
  question: '¿Cuál de las siguientes opciones describe mejor Machine Learning?',
  options: [
    { id: 'a', text: 'Un sistema que únicamente ejecuta código estático previamente compilado.' },
    { id: 'b', text: 'Una rama de la IA que permite a los sistemas aprender patrones a partir de datos.' },
    { id: 'c', text: 'Un hardware diseñado exclusivamente para almacenar bases de datos relacionales.' },
    { id: 'd', text: 'Un protocolo de red para transmitir paquetes TCP/IP.' },
  ],
  correctId: 'b',
  explanation:
    'Machine Learning es el subcampo de la IA que busca construir algoritmos capaces de extraer conocimiento y regularidades directamente a partir de datos.',
};

export default function QuizScreen() {
  const { theme } = useTheme();
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSelect = (id) => {
    if (hasSubmitted) return;
    setSelectedOption(id);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) {
      Alert.alert('Selecciona una opción', 'Por favor elige una respuesta antes de calificar.');
      return;
    }
    setHasSubmitted(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
  };

  const isCorrect = selectedOption === sampleQuiz.correctId;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <AnimatedEntrance type="slideDown" duration={400}>
        <View style={styles.header}>
          <Text style={[styles.badge, { color: theme.primary }]}>{sampleQuiz.subject.toUpperCase()}</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Quiz de Evaluación</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Pregunta generada por IA a partir de tus notas</Text>
        </View>
      </AnimatedEntrance>

      <AnimatedEntrance type="scale" duration={450} delay={150}>
        <View style={[styles.questionCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.questionText, { color: theme.textPrimary }]}>{sampleQuiz.question}</Text>
        </View>
      </AnimatedEntrance>

      <View style={styles.optionsList}>
        {sampleQuiz.options.map((opt, index) => {
          const isSelected = selectedOption === opt.id;
          let itemBg = theme.cardBg;
          let itemBorder = theme.border;
          let iconName = 'circle-outline';
          let iconColor = theme.textMuted;

          if (isSelected) {
            itemBg = `${theme.primary}20`;
            itemBorder = theme.primary;
            iconName = 'radiobox-marked';
            iconColor = theme.primary;
          }

          if (hasSubmitted) {
            if (opt.id === sampleQuiz.correctId) {
              itemBg = theme.successLight;
              itemBorder = theme.success;
              iconName = 'check-circle';
              iconColor = theme.success;
            } else if (isSelected && !isCorrect) {
              itemBg = theme.errorLight;
              itemBorder = theme.error;
              iconName = 'close-circle';
              iconColor = theme.error;
            }
          }

          return (
            <AnimatedEntrance key={opt.id} type="slideUp" duration={350} delay={200 + index * 60}>
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  { backgroundColor: itemBg, borderColor: itemBorder },
                ]}
                onPress={() => handleSelect(opt.id)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name={iconName} size={22} color={iconColor} />
                <Text style={[styles.optionText, { color: theme.textPrimary }]}>{opt.text}</Text>
              </TouchableOpacity>
            </AnimatedEntrance>
          );
        })}
      </View>

      {hasSubmitted && (
        <AnimatedEntrance type="slideUp" duration={400} style={[styles.feedbackCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.feedbackTitleRow}>
            <MaterialCommunityIcons
              name={isCorrect ? 'check-decagram' : 'alert-circle'}
              size={22}
              color={isCorrect ? theme.success : theme.error}
            />
            <Text style={[styles.feedbackTitle, { color: isCorrect ? theme.success : theme.error }]}>
              {isCorrect ? '¡Excelente! Respuesta Correcta (+10 pts)' : 'Respuesta Incorrecta'}
            </Text>
          </View>
          <Text style={[styles.explanationText, { color: theme.textSecondary }]}>{sampleQuiz.explanation}</Text>
        </AnimatedEntrance>
      )}

      <AnimatedEntrance type="slideUp" duration={400} delay={450}>
        {!hasSubmitted ? (
          <AnimatedPressable style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleCheckAnswer}>
            <Text style={styles.submitBtnText}>Comprobar Respuesta</Text>
            <MaterialCommunityIcons name="check-bold" size={18} color="#FFFFFF" />
          </AnimatedPressable>
        ) : (
          <AnimatedPressable style={[styles.resetBtn, { backgroundColor: theme.primaryLight }]} onPress={handleReset}>
            <Text style={[styles.resetBtnText, { color: theme.primary }]}>Intentar de nuevo</Text>
            <MaterialCommunityIcons name="refresh" size={18} color={theme.primary} />
          </AnimatedPressable>
        )}
      </AnimatedEntrance>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
  },
  questionCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    ...shadows.sm,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    ...shadows.sm,
  },
  optionText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  feedbackCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  feedbackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 18,
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    ...shadows.sm,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  resetBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  resetBtnText: {
    fontWeight: '700',
    fontSize: 15,
  },
});
