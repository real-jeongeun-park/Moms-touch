import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const RANK_COLORS = ['#FF9019', '#73ADFF', '#FFCA45'];
const RANK_LABELS = ['취향저격\n1위', '취향저격\n2위', '취향저격\n3위'];
const RANK_MEDALS = [
  require('../assets/images/gold_medal.png'),
  require('../assets/images/silver_medal.png'),
  require('../assets/images/bronze_medal.png'),
];

export default function Home() {
  const navigation = useNavigation() as any;
  const [recipes, setRecipes] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user) {
          setUserName(user.user_id);
          const recRes = await fetch(`${API_URL}/recipes/recommended?user_id=${user.id}`, { headers: { 'ngrok-skip-browser-warning': '1' } });
          const recData = await recRes.json();
          setRecommended(recData.recipes ?? []);
        }
        const res = await fetch(`${API_URL}/recipes`, { headers: { 'ngrok-skip-browser-warning': '1' } });
        const data = await res.json();
        setRecipes(data.recipes ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const topRecipes = recommended.length > 0 ? recommended.slice(0, 3) : recipes.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.logo}>엄마손맛</Text>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="찾고 싶은 손맛을 검색해보세요"
              placeholderTextColor="#9B9794"
            />
            <Image source={require('../assets/images/find_btn.png')} style={styles.findBtnImage} />
          </View>
          <Image source={require('../assets/images/grandma_find.png')} style={styles.grandmaImage} />
        </View>

        {/* 취향저격 순위 */}
        {topRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {recommended.length > 0 && userName ? `${userName}님 취향저격 TOP 3` : '인기 손맛 TOP 3'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.rankRow}>
                {topRecipes.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.rankCard}
                    onPress={() => navigation.navigate('RecipeDetail', { recipe_id: item.id })}
                  >
                    <View style={[styles.rankCardTop, { backgroundColor: RANK_COLORS[index] }]}>
                      <Text style={styles.rankLabel}>{RANK_LABELS[index]}</Text>
                      <Image source={RANK_MEDALS[index]} style={styles.medalImage} />
                    </View>
                    <View style={styles.rankCardBottom}>
                      <Text style={styles.rankTitle}>{item.title}</Text>
                      <Text style={styles.rankDesc} numberOfLines={2}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 인기 레시피 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인기레시피</Text>
          {recipes.map(item => (
            <TouchableOpacity key={item.id} style={styles.recipeCard} onPress={() => navigation.navigate('RecipeDetail', { recipe_id: item.id })}>
              <Text style={styles.recipeTitle}>{item.title}</Text>
              <Text style={styles.recipeDesc}>{item.description}</Text>
              <View style={styles.recipeFooter}>
                <TouchableOpacity
                  style={styles.authorTap}
                  onPress={() => navigation.navigate('UserProfile', { name: item.author })}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatar} />
                  <Text style={styles.recipeAuthor}>{item.author ?? item.region}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },

  // 헤더
  header: { backgroundColor: '#FF9019', padding: 28, paddingTop: 32, gap: 16, overflow: 'visible' },
  grandmaImage: { width: 70, height: 70, resizeMode: 'contain', position: 'absolute', right: 36, top: 8 },
  logo: { fontSize: 18, fontWeight: '800', color: '#F2F2F2' },
  searchBox: {
    backgroundColor: '#FFFFFF', borderRadius: 15, paddingHorizontal: 16,
    paddingVertical: 10, borderWidth: 1, borderColor: '#F2F2F2',
    flexDirection: 'row', alignItems: 'center',
  },
  searchInput: { flex: 1, fontSize: 16, color: '#181818' },
  findBtnImage: { width: 20, height: 20, resizeMode: 'contain' },

  // 섹션
  section: { paddingHorizontal: 28, paddingTop: 32, gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#181818', marginBottom: 12 },

  // 취향저격 카드
  rankRow: { flexDirection: 'row', gap: 12 },
  rankCard: {
    width: 200, borderRadius: 12, borderWidth: 1,
    borderColor: '#E6E6E6', overflow: 'hidden', backgroundColor: '#FFFFFF',
  },
  rankCardTop: { padding: 16, height: 84, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rankLabel: { fontSize: 16, fontWeight: '700', color: '#F2F2F2' },
  medalImage: { width: 72, height: 72, resizeMode: 'contain' },
  rankCardBottom: { padding: 12 },
  rankTitle: { fontSize: 12, fontWeight: '700', color: '#181818' },
  rankDesc: { fontSize: 10, color: '#827E7B', marginTop: 2 },

  // 레시피 카드
  recipeCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1,
    borderColor: '#E6E6E6', padding: 20, marginBottom: 12,
    shadowColor: '#B7B7B7', shadowOpacity: 0.35, shadowRadius: 11.8,
    elevation: 3,
  },
  recipeTitle: { fontSize: 17, fontWeight: '800', color: '#181818', marginBottom: 4 },
  recipeDesc: { fontSize: 14, color: '#827E7B', lineHeight: 21, marginBottom: 12 },
  recipeFooter: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  authorTap: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  avatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F3F3F3' },
  recipeAuthor: { fontSize: 14, color: '#181818' },
  emptyText: { fontSize: 14, color: '#9B9794', textAlign: 'center', paddingVertical: 24 },
});