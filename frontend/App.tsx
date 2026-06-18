import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from './screens/Home';
import RecipeCreate from './screens/RecipeCreate';
import Map from './screens/Map';
import MyPage from './screens/MyPage';
import RecipeDetail from './screens/RecipeDetail';
import RecipeStart from './screens/RecipeStart';
import RecipeFollow from './screens/RecipeFollow';
import RecipeComplete from './screens/RecipeComplete';
import RecipeVoice from './screens/RecipeVoice';
import RecipeRecording from './screens/RecipeRecording';
import RecipeChat from './screens/RecipeChat';
import RegionSelect from './screens/RegionSelect';
import RecipeProcessing from './screens/RecipeProcessing';
import RecipeReview from './screens/RecipeReview';
import RecipeUploadDone from './screens/RecipeUploadDone';
import OnboardingPreferences from './screens/OnboardingPreferences';
import ProfileSetup from './screens/ProfileSetup';
import UserProfile from './screens/UserProfile';

SplashScreen.preventAutoHideAsync();

// ngrok 브라우저 경고 페이지 우회
const _originalFetch = global.fetch;
(global as any).fetch = (url: RequestInfo | URL, options?: RequestInit) => {
  const headers = { 'ngrok-skip-browser-warning': '1', ...(options?.headers ?? {}) };
  return _originalFetch(url as any, { ...options, headers });
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const icons: Record<string, { empty: any; full: any }> = {
  Home:   { empty: require('./assets/images/Home_empty.png'),   full: require('./assets/images/Home_full.png') },
  Map:    { empty: require('./assets/images/map_empty.png'),    full: require('./assets/images/map_full.png') },
  Recipe: { empty: require('./assets/images/Recipe_empty.png'), full: require('./assets/images/Recipe_full.png') },
  Mypage: { empty: require('./assets/images/Mypage_empty.png'), full: require('./assets/images/Mypage_full.png') },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 9, marginBottom: 8 },
        tabBarItemStyle: { paddingTop: 10, gap: 4 },
        tabBarActiveTintColor: '#FF9019',
        tabBarInactiveTintColor: '#9B9794',
        tabBarStyle: { height: 80, borderTopWidth: 1, borderTopColor: '#E6E6E6' },
        tabBarIcon: ({ focused }) => (
          <Image
            source={focused ? icons[route.name].full : icons[route.name].empty}
            style={{ width: 28, height: 28, resizeMode: 'contain' }}
          />
        ),
      })}
    >
      <Tab.Screen name="Home"   component={Home}         options={{ tabBarLabel: '홈' }} />
      <Tab.Screen name="Map"    component={Map}          options={{ tabBarLabel: '손맛 보관함' }} />
      <Tab.Screen name="Recipe" component={RecipeCreate} options={{ tabBarLabel: '레시피 만들기' }} />
      <Tab.Screen name="Mypage" component={MyPage}       options={{ tabBarLabel: '마이페이지' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [loaded] = useFonts({
    'NanumHuman-Regular': require('./assets/fonts/NanumHumanRegular.ttf'),
    'NanumHuman-Bold': require('./assets/fonts/NanumHumanBold.ttf'),
    'NanumHuman-EB': require('./assets/fonts/NanumHumanEB.ttf'),
  });
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const userStr = await AsyncStorage.getItem('user');
      setInitialRoute(userStr ? 'Main' : 'ProfileSetup');
    };
    check();
  }, []);

  useEffect(() => {
    if (loaded && initialRoute) { SplashScreen.hideAsync(); }
  }, [loaded, initialRoute]);

  if (!loaded || !initialRoute) { return null; }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
        <Stack.Screen name="OnboardingPreferences" component={OnboardingPreferences} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetail} />
        <Stack.Screen name="RecipeStart" component={RecipeStart} />
        <Stack.Screen name="RecipeFollow" component={RecipeFollow} />
        <Stack.Screen name="RecipeComplete" component={RecipeComplete} />
        <Stack.Screen name="RecipeVoice" component={RecipeVoice} />
        <Stack.Screen name="RecipeRecording" component={RecipeRecording} />
        <Stack.Screen name="RecipeChat" component={RecipeChat} />
        <Stack.Screen name="RegionSelect" component={RegionSelect} />
        <Stack.Screen name="RecipeProcessing" component={RecipeProcessing} />
        <Stack.Screen name="RecipeReview" component={RecipeReview} />
        <Stack.Screen name="RecipeUploadDone" component={RecipeUploadDone} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
