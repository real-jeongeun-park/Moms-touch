import { useState, useCallback } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const ngrokHeader = { 'ngrok-skip-browser-warning': '1' };

type TabType = 'made' | 'liked';

export default function UserProfile() {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  const name = route.params?.name ?? '인자 할머니';
  const region = route.params?.region ?? '전라도';

  const [activeTab, setActiveTab] = useState<TabType>('made');
  const [madeRecipes, setMadeRecipes] = useState<any[]>([]);
  const [likedRecipes, setLikedRecipes] = useState<any[]>([]);
  const [stats, setStats] = useState({ recipe_count: 0, challenger_count: 0, like_received: 0 });
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_URL}/users/by-nickname/${encodeURIComponent(name)}/profile`,
          { headers: ngrokHeader }
        );
        if (!res.ok) throw new Error('profile fetch 실패');
        const data = await res.json();
        setMadeRecipes(data.made ?? []);
        setLikedRecipes(data.liked ?? []);
        setStats(data.stats ?? { recipe_count: 0, challenger_count: 0, like_received: 0 });
      } catch (e) {
        console.log('유저 프로필 로드 에러:', e);
        setMadeRecipes([]);
        setLikedRecipes([]);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [name]));

  const recipes = activeTab === 'made' ? madeRecipes : likedRecipes;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" backgroundColor="#FFA23E" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 주황 헤더 (스크롤 안에 두어야 프로필이 잘리지 않음) */}
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.heroTopRow}>
              <View style={styles.regionBlock}>
                <Text style={styles.regionLabel}>지역</Text>
                <Text style={styles.regionText}>{region}</Text>
              </View>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
                <Image source={require('../assets/images/back.png')} style={styles.backIcon} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* 헤더에 걸친 원형 프로필 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Image
              source={require('../assets/images/grandma_mypage.png')}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.name}>{name}</Text>

          <View style={styles.statsBox}>
            <StatItem label="레시피" value={String(stats.recipe_count)} />
            <View style={styles.statDivider} />
            <StatItem label="레시피 도전자" value={String(stats.challenger_count)} />
            <View style={styles.statDivider} />
            <StatItem label="좋아요 받은 수" value={String(stats.like_received)} />
          </View>
        </View>

        {/* 탭 */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('made')} activeOpacity={0.8}>
            <Text style={[styles.tabText, activeTab === 'made' && styles.tabTextActive]}>만든 레시피</Text>
            {activeTab === 'made' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('liked')} activeOpacity={0.8}>
            <Text style={[styles.tabText, activeTab === 'liked' && styles.tabTextActive]}>좋아요 누른 레시피</Text>
            {activeTab === 'liked' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* 카드 목록 */}
        {loading ? (
          <ActivityIndicator color="#FFA23E" style={{ marginTop: 32 }} />
        ) : recipes.length === 0 ? (
          <Text style={styles.emptyText}>
            {activeTab === 'made' ? '아직 올린 레시피가 없어요' : '아직 좋아요 누른 레시피가 없어요'}
          </Text>
        ) : (
          <View style={styles.cardList}>
            {recipes.map(recipe => (
              <TouchableOpacity
                key={`${activeTab}-${recipe.id}`}
                style={styles.recipeCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('RecipeDetail', { recipe_id: recipe.id })}
              >
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.recipeDesc} numberOfLines={2}>{recipe.description}</Text>
                <View style={styles.authorRow}>
                  <Image source={require('../assets/images/profile.png')} style={styles.authorAvatar} resizeMode="cover" />
                  <Text style={styles.authorText}>{recipe.author ?? name}</Text>
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

const AVATAR = 96;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  hero: {
    backgroundColor: '#FFA23E',
    paddingBottom: 48, // 원형 프로필이 절반 걸치도록 여백
  },
  heroSafe: {
    paddingHorizontal: 28,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 12,
    minHeight: 72,
  },
  regionBlock: {
    gap: 4,
    marginTop: 4,
  },
  regionLabel: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 16,
    color: '#F6F6F6',
  },
  regionText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 22,
    color: '#FFFFFF',
  },
  backBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 28,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 28,
    marginTop: -AVATAR / 2, // 헤더 하단에 절반 걸치게
    zIndex: 10, // 주황 헤더 위로 올라오게
  },
  avatarCircle: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: '#FCFCFC',
    borderWidth: 4,
    borderColor: '#FCFCFC', // 주황 바 위로 떠 보이도록 흰색 링
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 10,
    elevation: 6, // 안드로이드에서 헤더 위로
    shadowColor: '#7A4A12',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  avatarImage: {
    width: 81,
    height: 95,
  },
  name: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 22,
    color: '#181818',
    marginTop: 16,
  },
  statsBox: {
    width: '100%',
    borderRadius: 9,
    backgroundColor: '#F6F6F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
    fontSize: 14,
    color: '#595653',
  },
  statValue: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 14,
    color: '#42403D',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E6E6E6',
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 36,
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(230,230,230,0.5)',
  },
  tabButton: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: 'NanumHuman-Regular',
    fontSize: 16,
    color: '#8D8986',
  },
  tabTextActive: {
    fontFamily: 'NanumHuman-Bold',
    color: '#FFA23E',
  },
  tabIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 2,
    backgroundColor: '#FFA23E',
  },
  cardList: {
    paddingHorizontal: 28,
    paddingTop: 24,
    gap: 12,
  },
  recipeCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    padding: 20,
    shadowColor: '#B7B7B7',
    shadowOpacity: 0.35,
    shadowRadius: 11.8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  recipeTitle: {
    fontFamily: 'NanumHuman-EB',
    fontSize: 17,
    color: '#181818',
  },
  recipeDesc: {
    marginTop: 8,
    fontFamily: 'NanumHuman-Regular',
    fontSize: 17,
    lineHeight: 27,
    color: '#595653',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 20,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F3F3',
    overflow: 'hidden',
  },
  authorText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 16,
    color: '#181818',
  },
  emptyText: {
    fontFamily: 'NanumHuman-Regular',
    fontSize: 14,
    color: '#9B9794',
    textAlign: 'center',
    marginTop: 40,
  },
});
