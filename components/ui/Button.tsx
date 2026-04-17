import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'coral' | 'sky' | 'mustard';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary': return { backgroundColor: Colors.primary.sage };
      case 'secondary': return { backgroundColor: Colors.primary.lilac };
      case 'coral': return { backgroundColor: Colors.primary.coral };
      case 'sky': return { backgroundColor: Colors.primary.sky };
      case 'mustard': return { backgroundColor: Colors.primary.mustard };
      case 'outline': return { backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.primary.sage };
      case 'ghost': return { backgroundColor: 'transparent' };
      default: return { backgroundColor: Colors.primary.sage };
    }
  };

  const getTextStyle = () => {
    const isOutlineOrGhost = variant === 'outline' || variant === 'ghost';
    return {
      color: isOutlineOrGhost ? Colors.primary.sage : Colors.background.white,
      fontSize: size === 'lg' ? Typography.sizes.title2 : Typography.sizes.body,
      fontWeight: 'bold',
    } as TextStyle;
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Spacing.radius_sm };
      case 'lg': return { paddingVertical: 20, paddingHorizontal: 40, borderRadius: Spacing.radius_xl };
      default: return { paddingVertical: 14, paddingHorizontal: 28, borderRadius: Spacing.radius_lg };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.primary.sage : Colors.background.white} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, getTextStyle()]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
