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

export default function RecipeReview() {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  const recipe = route.params?.recipe;

  const INFO = [
    { label: '지역', value: recipe.region, type: 'text' },
    { label: '소요 시간', value: `${recipe.duration}분`, type: 'text' },
    { label: '난이도', value: recipe.difficulty, type: 'star' },
  ];

  // timestamp는 분 단위 숫자로 오니까 "05:00" 형식으로 변환
  const formatTime = (minutes: number) => {
    const m = String(Math.floor(minutes)).padStart(2, '0');
    return `${m}:00`;
  };

  let accumulated = 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>

        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchBtn}>
            <Image source={require('../assets/images/find_btn.png')} style={styles.searchIcon} />
          </TouchableOpacity>
        </View>

        {/* 제목 영역 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{recipe.region} {recipe.title}</Text>
          <Text style={styles.subtitle}>{recipe.description}</Text>

          {/* 정보 */}
          <View style={styles.infoBox}>
            {INFO.map(item => (
              <View key={item.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                {item.type === 'star'
                  ? <Image source={starImages[item.value as number]} style={styles.starImage} />
                  : <Text style={styles.infoValue}>{item.value}</Text>
                }
              </View>
            ))}

            {/* 재료 */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>재료</Text>
              <View style={styles.ingredientRow}>
                {Object.entries(recipe.ingredients).map(([name, amount]) => (
                  <View key={name} style={styles.ingredientItem}>
                    <Text style={styles.ingName}>{name}</Text>
                    <Text style={styles.ingAmount}>{amount as string}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 레시피 단계 */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>레시피</Text>
          <View>
            <View style={styles.dashedLine} />
              {(() => {
                let accumulated = 0;
                return recipe.steps.map((step: any) => {
                  const current = accumulated
                  accumulated += Number(step.timestamp);
                  return (
                    <View key={step.step_order} style={styles.stepRow}>
                      <View style={styles.stepLeft}>
                        <View style={styles.stepBadge}>
                          <Text style={styles.stepBadgeText}>{step.step_order}</Text>
                        </View>
                      </View>
                      <View style={styles.stepRight}>
                        <Text style={styles.stepTime}>{formatTime(current)}</Text>
                        <View style={styles.stepCard}>
                          <View style={styles.stepCardHeader}>
                            <Text style={styles.stepTitle}>{step.title}</Text>
                            <TouchableOpacity style={styles.editBtn}>
                              <Text style={styles.editBtnText}>수정하기</Text>
                              <Image source={require('../assets/images/edit.png')} style={styles.editIcon} />
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.stepDesc}>{step.description}</Text>
                        </View>
                      </View>
                    </View>
                  );
                });
              })()}
          </View>
        </View>

      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.uploadBtn} onPress={() => navigation.navigate('RecipeUploadDone', {recipe})}>
          <Text style={styles.uploadBtnText}>업로드 하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: '#827E7B' },
  searchBtn: { padding: 4 },
  searchIcon: { width: 22, height: 22, resizeMode: 'contain' },

  titleSection: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#181818', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#8D8986', marginBottom: 20 },

  infoBox: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoLabel: { width: 60, fontSize: 12, fontWeight: '700', color: '#181818' },
  infoValue: { fontSize: 12, color: '#181818' },
  starImage: { width: 80, height: 16, resizeMode: 'contain', marginLeft: -20 },

  ingredientRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, flex: 1 },
  ingredientItem: { alignItems: 'center', gap: 2 },
  ingName: { fontSize: 12, color: '#181818', textAlign: 'center' },
  ingAmount: { fontSize: 11, color: '#42403D', textAlign: 'center' },

  divider: { height: 12, backgroundColor: '#F6F4F4', marginVertical: 8 },

  stepsSection: { paddingHorizontal: 28, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#181818', marginBottom: 20 },
  dashedLine: { position: 'absolute', left: 9, top: 0, bottom: 0, width: 2, borderStyle: 'dashed', borderLeftWidth: 2, borderColor: '#FFD8AF' },

  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stepLeft: { width: 20, alignItems: 'center', zIndex: 1 },
  stepBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFCA45', justifyContent: 'center', alignItems: 'center' },
  stepBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  stepRight: { flex: 1, gap: 4 },
  stepTime: { fontSize: 13, color: '#827E7B' },
  stepCard: { backgroundColor: '#FFFFFF', borderRadius: 4, borderWidth: 1, borderColor: '#E6E6E6', padding: 12, shadowColor: '#3D3B3A', shadowOpacity: 0.09, shadowRadius: 7.3, elevation: 2 },
  stepCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#181818', flex: 1, marginRight: 8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8 },
  editIcon: { width: 16, height: 16, resizeMode: 'contain' },
  editBtnText: { fontSize: 11, color: '#827E7B' },
  stepDesc: { fontSize: 11, color: '#827E7B', lineHeight: 16 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 28, paddingBottom: 40, paddingTop: 12, backgroundColor: '#FCFCFC' },
  uploadBtn: { backgroundColor: '#FFA23E', borderRadius: 15, height: 60, alignItems: 'center', justifyContent: 'center' },
  uploadBtnText: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
});
