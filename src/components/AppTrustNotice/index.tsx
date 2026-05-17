import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import AppText from '../AppText';
import {COLORS} from '../../constants/colors';

type Props = {
  summary: string;
  details?: string;
  expandLabel?: string;
  collapseLabel?: string;
};

const AppTrustNotice = ({
  summary,
  details,
  expandLabel,
  collapseLabel,
}: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <AppText
        value={summary}
        fontSize={12}
        fontWeight={400}
        color={COLORS.foundation.neutral.n500}
      />
      {!!details && (
        <>
          {expanded && (
            <AppText
              value={details}
              fontSize={12}
              fontWeight={400}
              color={COLORS.foundation.neutral.n500}
              textStyle={styles.details}
            />
          )}
          <Pressable onPress={() => setExpanded(prev => !prev)}>
            <AppText
              value={expanded ? collapseLabel || '' : expandLabel || ''}
              fontSize={12}
              fontWeight={700}
              color={COLORS.foundation.blue.b300}
            />
          </Pressable>
        </>
      )}
    </View>
  );
};

export default AppTrustNotice;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.foundation.neutral.n100,
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  details: {
    lineHeight: 18,
  },
});

