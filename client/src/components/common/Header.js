import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

export default function Header({ 
  title, 
  leftIcon, 
  rightIcon, 
  onLeftPress, 
  onRightPress, 
  showBackButton = false,
  navigation,
  style = {}
}) {
  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    } else if (onLeftPress) {
      onLeftPress();
    }
  };

  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.header}>
        {/* Left section */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
          {leftIcon && (
            <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
              <Ionicons name={leftIcon} size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right section */}
        <View style={styles.rightSection}>
          {rightIcon && (
            <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
              <Ionicons name={rightIcon} size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 60,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
  },
});
