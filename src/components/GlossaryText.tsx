import React, { useMemo } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { splitByTerms } from '@/lib/glossary';

/**
 * Texto con los términos del glosario en negrilla y subrayados. Si recibe `materialId`, tocar un
 * término abre su pantalla con el significado y el contexto; sin él solo se resaltan.
 */
export function GlossaryText({
  text,
  terms,
  materialId,
  style,
}: {
  text: string;
  terms: string[];
  materialId?: string;
  style?: StyleProp<TextStyle>;
}) {
  const { theme } = useTheme();
  const segments = useMemo(() => splitByTerms(text, terms), [text, terms]);

  return (
    <Text style={style}>
      {segments.map((segment, index) =>
        segment.term ? (
          <Text
            key={index}
            accessibilityRole={materialId ? 'link' : undefined}
            accessibilityHint={materialId ? 'Abre el significado de este término' : undefined}
            suppressHighlighting={false}
            onPress={
              materialId
                ? () => router.push({ pathname: '/termino', params: { materialId, term: segment.term } })
                : undefined
            }
            style={{ fontWeight: '800', textDecorationLine: 'underline', color: theme.textPrimary }}
          >
            {segment.text}
          </Text>
        ) : (
          <Text key={index}>{segment.text}</Text>
        )
      )}
    </Text>
  );
}
