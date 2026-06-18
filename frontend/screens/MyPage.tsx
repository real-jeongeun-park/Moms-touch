import { useState, useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

type TabType = 'made' | 'followed';

export default function MyPage() {
  const navigation = useNavigation() as any;
  const [activeTab, setActiveTab] = useState<TabType>('made');
  const [userName, setUserName] = useState('');
  const [madeRecipes, setMadeRecipes] = useState<any[]>([]);
  const [followedRecipes, setFollowedRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userStr = await AsyncStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user) return;
        setUserName(user.user_id);
        const [madeRes, followedRes] = await Promise.all([
          fetch(`${API_URL}/users/${user.id}/recipes/made`),
          fetch(`${API_URL}/users/${user.id}/recipes/followed`),
        ]);
        const madeData = await madeRes.json();
        const followedData = await followedRes.json();
        setMadeRecipes(madeData.recipes ?? []);
        setFollowedRecipes(followedData.recipes ?? []);
      } catch (e) {
        console.log('마이페이지 로드 에러:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []));

  const displayRecipes = activeTab === 'made' ? madeRecipes : followedRecipes;

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.reset({ index: 0, routes: [{ name: 'ProfileSetup' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFA23E" />

      <View style={styles.hero}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
          <Image source={require('../assets/images/logout.png')} style={styles.logoutIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageWrap}>
            <Image
              source={require('../assets/images/grandma_mypage.png')}
              style={styles.profileImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{userName || '...'}</Text>
          </View>

          <View style={styles.statsBox}>
            <StatItem label="만든 레시피" value={String(madeRecipes.length)} />
            <View style={styles.statDivider} />
            <StatItem label="따라해본 레시피" value={String(followedRecipes.length)} />
          </View>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('made')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'made' && styles.tabTextActive]}>
              만든 레시피
            </Text>
            {activeTab === 'made' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('followed')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'followed' && styles.tabTextActive]}>
              따라해본 레시피
            </Text>
            {activeTab === 'followed' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#FF9019" style={{ marginTop: 32 }} />
        ) : displayRecipes.length === 0 ? (
          <Text style={styles.emptyText}>
            {activeTab === 'made' ? '아직 올린 레시피가 없어요' : '아직 따라해본 레시피가 없어요'}
          </Text>
        ) : (
          <View style={styles.cardList}>
            {displayRecipes.map(recipe => (
              <TouchableOpacity
                key={`${activeTab}-${recipe.id}`}
                style={styles.recipeCard}
                onPress={() => navigation.navigate('RecipeDetail', { recipe_id: recipe.id })}
                activeOpacity={0.85}
              >
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.recipeDesc} numberOfLines={3}>{recipe.description}</Text>
                <View style={styles.regionRow}>
                  <Text style={styles.regionText}>{recipe.region}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  hero: {
    height: 96,
    backgroundColor: '#FFA23E',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  logoutBtn: {
    padding: 4,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  scrollContent: {
    paddingBottom: 28,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 28,
  },
  profileImageWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADADA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 78,
    height: 78,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
  },
  name: {
    fontFamily: 'NanumHuman-EB',
    fontSize: 20,
    color: '#181818',
  },
  statsBox: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  statLabel: {
    fontFamily: 'NanumHuman-Regular',
    fontSize: 11,
    color: '#827E7B',
  },
  statValue: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 12,
    color: '#42403D',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E0E0E0',
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 22,
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  tabButton: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 14,
    color: '#8D8986',
  },
  tabTextActive: {
    color: '#FF9019',
  },
  tabIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 2,
    backgroundColor: '#FF9019',
  },
  cardList: {
    paddingHorizontal: 28,
    paddingTop: 18,
    gap: 12,
  },
  recipeCard: {
    minHeight: 126,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 17,
    paddingVertical: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  recipeTitle: {
    fontFamily: 'NanumHuman-EB',
    fontSize: 18,
    color: '#181818',
  },
  recipeDesc: {
    marginTop: 8,
    fontFamily: 'NanumHuman-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#827E7B',
  },
  regionRow: {
    marginTop: 12,
  },
  regionText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 13,
    color: '#FFA23E',
  },
  emptyText: {
    fontFamily: 'NanumHuman-Regular',
    fontSize: 14,
    color: '#9B9794',
    textAlign: 'center',
    marginTop: 40,
  },
});
