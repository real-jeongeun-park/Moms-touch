import { View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const recipes = [
  { id: 1, title: '고들빼기김치', desc: '쌉싸름한 고들빼기에 젓갈 양념을 더한 김치', author: '인자 할머니', done: false },
  { id: 2, title: '고들빼기김치', desc: '쌉싸름한 고들빼기에 젓갈 양념을 더한 김치', author: '인자 할머니', done: true },
  { id: 3, title: '고들빼기김치', desc: '쌉싸름한 고들빼기에 젓갈 양념을 더한 김치', author: '인자 할머니', done: false },
];

const ranks = [
  { id: 1, rank: '취향저격\n1위', title: '강원도 감자옹심이', desc: '감자로 빚어 따뜻하게 만든 옹심이', color: '#FF9019', medal: require('../assets/images/gold_medal.png') },
  { id: 2, rank: '취향저격\n2위', title: '전라도 고들빼기김치', desc: '전라도 고들빼기에 젓갈 양념을 더한 김치', color: '#73ADFF', medal: require('../assets/images/silver_medal.png') },
  { id: 3, rank: '취향저격\n3위', title: '경상도 동태찌개', desc: '칼칼하고 시원한 동태찌개', color: '#FFCA45', medal: require('../assets/images/bronze_medal.png') },
];

export default function Home() {
      const navigation = useNavigation() as any;
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>홍길동님이 좋아하실만한 손맛</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.rankRow}>
              {ranks.map(item => (
                <View key={item.id} style={styles.rankCard}>
                  <View style={[styles.rankCardTop, { backgroundColor: item.color }]}>
                    <Text style={styles.rankLabel}>{item.rank}</Text>
                    <Image source={item.medal} style={styles.medalImage} />
                  </View>
                  <View style={styles.rankCardBottom}>
                    <Text style={styles.rankTitle}>{item.title}</Text>
                    <Text style={styles.rankDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 인기 레시피 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인기레시피</Text>
          {recipes.map(item => (
            <TouchableOpacity key={item.id} style={styles.recipeCard} onPress={() => navigation.navigate('RecipeDetail', { recipe_id: 1 })}>
              <Text style={styles.recipeTitle}>{item.title}</Text>
              <Text style={styles.recipeDesc}>{item.desc}</Text>
              <View style={styles.recipeFooter}>
                <TouchableOpacity
                  style={styles.authorTap}
                  onPress={() => navigation.navigate('UserProfile', { name: item.author })}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatar} />
                  <Text style={styles.recipeAuthor}>{item.author}</Text>
                </TouchableOpacity>
                {item.done && (
                  <View style={styles.doneBadge}>
                    <Text style={styles.doneText}>완료</Text>
                  </View>
                )}
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
  doneBadge: {
    backgroundColor: '#FFA23E', borderRadius: 50,
    paddingHorizontal: 10, paddingVertical: 6, marginLeft: 'auto',
  },
  doneText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
});