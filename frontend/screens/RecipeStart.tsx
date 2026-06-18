import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

const starImages: Record<number, any> = {
  1: require('../assets/images/star1.png'),
  2: require('../assets/images/star2.png'),
  3: require('../assets/images/star3.png'),
  4: require('../assets/images/star4.png'),
  5: require('../assets/images/star5.png'),
};

export default function RecipeStart() {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  const recipe = route.params?.recipe;

  const ingredients: { name: string; amount: string }[] = (() => {
    if (!recipe) return [];
    const raw = recipe.ingredients;
    if (Array.isArray(raw)) return raw;
    const obj = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? {});
    return Object.entries(obj).map(([name, amount]) => ({ name, amount: amount as string }));
  })();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image source={require('../assets/images/back.png')} style={styles.backIcon} />
          </TouchableOpacity>
        </View>

        {/* 제목 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{recipe ? `${recipe.region} ${recipe.title}` : ''}</Text>
          <Text style={styles.subtitle}>{recipe?.description ?? ''}</Text>
        </View>

        {/* 할머니 이미지 */}
        <View style={styles.imageSection}>
          <View style={styles.shadowEllipse} />
          <Image source={require('../assets/images/grandma_cook.png')} style={styles.grandmaImage} />
        </View>

        {/* 정보 */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>소요 시간</Text>
            <Text style={styles.infoValue}>{recipe?.duration ?? 0}분</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>난이도</Text>
            <Image source={starImages[recipe?.difficulty ?? 1]} style={styles.starImage} />
          </View>
          <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
            <Text style={[styles.infoLabel, { paddingTop: 4 }]}>재료</Text>
            <View style={styles.ingredientGrid}>
              {ingredients.map(ing => (
                <View key={ing.name} style={styles.ingredientItem}>
                  <Text style={styles.ingName}>{ing.name}</Text>
                  <Text style={styles.ingAmount}>{ing.amount}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('RecipeFollow', { steps: recipe?.steps ?? [], recipe })}>
          <Text style={styles.startBtnText}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },

  header: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 8 },
  backBtn: { padding: 4, width: 28, height: 28, justifyContent: 'center' },
  backIcon: { width: 20, height: 20, resizeMode: 'contain' },

  titleSection: { alignItems: 'center', paddingHorizontal: 28, marginTop: 40, gap: 9 },
  title: { fontSize: 24, fontWeight: '800', color: '#181818', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#8D8986', textAlign: 'center' },

  imageSection: { alignItems: 'center', justifyContent: 'center', marginTop: 52, height: 220 },
  shadowEllipse: {
    position: 'absolute', bottom: 20, width: 144, height: 23,
    backgroundColor: '#E8E8E8', borderRadius: 72,
  },
  grandmaImage: { width: 260, height: 200, resizeMode: 'contain' },

  infoSection: { paddingLeft: 55, paddingRight: 28, marginTop: 32, gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { width: 60, fontSize: 12, fontWeight: '700', color: '#181818' },
  infoValue: { fontSize: 12, color: '#181818' },
  starImage: { width: 80, height: 16, resizeMode: 'contain', marginLeft: -28 },

  ingredientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, flex: 1 },
  ingredientItem: { alignItems: 'center', gap: 3 },
  ingName: { fontSize: 12, color: '#181818', textAlign: 'center' },
  ingAmount: { fontSize: 11, color: '#42403D', textAlign: 'center' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 28, paddingBottom: 120, paddingTop: 12, backgroundColor: '#FCFCFC',
  },
  startBtn: { backgroundColor: '#FFA23E', borderRadius: 15, paddingVertical: 16, alignItems: 'center' },
  startBtnText: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
});
