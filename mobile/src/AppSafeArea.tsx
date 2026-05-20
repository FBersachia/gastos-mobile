import { PropsWithChildren } from 'react';
import { SafeAreaView, StyleProp, ViewStyle } from 'react-native';

export function AppSafeAreaProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export function AppSafeAreaView({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <SafeAreaView style={style}>{children}</SafeAreaView>;
}
