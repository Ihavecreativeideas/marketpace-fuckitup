import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../utils/colors';

export default function Header({
  title,
  showBack = false,
  onBackPress,
  showCart = false,
  cartItemCount = 0,
  onCartPress,
  showProfile = false,
  onProfilePress,
  rightComponent,
  style,
  titleStyle,
  backgroundColor = colors.white,
  textColor = colors.text,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }, style]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      <View style={styles.header}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
              <Ionicons name="chevron-back" size={24} color={textColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: textColor }, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {rightComponent}
          
          {showProfile && (
            <TouchableOpacity style={styles.iconButton} onPress={onProfilePress}>
              <Ionicons name="person-circle-outline" size={24} color={textColor} />
            </TouchableOpacity>
          )}

          {showCart && (
            <TouchableOpacity style={styles.iconButton} onPress={onCartPress}>
              <View style={styles.cartIconContainer}>
                <Ionicons name="bag-outline" size={24} color={textColor} />
                {cartItemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
