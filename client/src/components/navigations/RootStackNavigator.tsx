import {
  StackNavigationProp,
  createStackNavigator,
} from '@react-navigation/stack';

import AuthStack from './AuthStackNavigator';
import ImageSlider from '../pages/ImageSlider';
import MainStack from './MainStackNavigator';
import {NavigationContainer} from '@react-navigation/native';
import NotFound from '../pages/NotFound';
import {Platform} from 'react-native';
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import WebView from '../pages/WebView';
import {useAuthContext} from '../../providers/AuthProvider';
import {useTheme} from 'dooboo-ui';

export type RootStackParamList = {
  default: undefined;
  AuthStack: undefined;
  MainStack: undefined;
  WebView: {
    uri: string;
  };
  ImageSlider: {
    images: {uri: string | null; sender?: string | null}[];
    initialIndex?: number;
  };
  NotFound: undefined;
};

export type RootStackNavigationProps<
  T extends keyof RootStackParamList = 'default'
> = StackNavigationProp<RootStackParamList, T>;

const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator(): React.ReactElement {
  const {theme} = useTheme();

  const linking = {
    prefixes: ['https://hackatalk.dev', 'hackatalk://'],
    enabled: true,
  };

  const {
    state: {user},
  } = useAuthContext();

  return (
    <SafeAreaProvider>
      <NavigationContainer
        linking={Platform.select({
          web: linking,
        })}
        theme={{
          colors: {
            background: theme.background,
            border: theme.disabled,
            card: theme.itemBackground,
            primary: theme.primary,
            notification: theme.tintColor,
            text: theme.text,
          },
          dark: true,
        }}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.background,
            },
            headerTitleStyle: {color: theme.text},
            headerTintColor: theme.tintColor,
            headerShown: false,
          }}>
          {!user || !user.verified ? (
            <Stack.Screen
              name="AuthStack"
              component={AuthStack}
              options={{
                gestureDirection: Platform.select({
                  ios: !user ? 'horizontal-inverted' : 'horizontal',
                  default: !user ? 'vertical-inverted' : 'vertical',
                }),
              }}
            />
          ) : (
            <Stack.Screen
              name="MainStack"
              component={MainStack}
              options={{
                gestureDirection: Platform.select({
                  ios: !user ? 'horizontal-inverted' : 'horizontal',
                  default: !user ? 'vertical-inverted' : 'vertical',
                }),
              }}
            />
          )}
          <Stack.Screen
            name="WebView"
            component={WebView}
            options={{
              headerShown: true,
              headerTitle: '',
              headerBackTitle: '',
            }}
          />
          <Stack.Screen
            name="ImageSlider"
            component={ImageSlider}
            options={({
              route: {
                params: {images, initialIndex = 0},
              },
            }) => ({
              headerShown: true,
              headerBackTitle: images[initialIndex]?.sender || '',
              headerTitle: '',
              headerTransparent: true,
            })}
          />
          <Stack.Screen name="NotFound" component={NotFound} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default RootNavigator;
