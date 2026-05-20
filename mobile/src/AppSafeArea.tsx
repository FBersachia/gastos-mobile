import { PropsWithChildren } from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export function AppSafeAreaProvider({ children }: PropsWithChildren) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}

export function AppSafeAreaView({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <SafeAreaView edges={Platform.OS === 'web' ? [] : ['top', 'right', 'bottom', 'left']} style={style}>
      {children}
    </SafeAreaView>
  );
}
