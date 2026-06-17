import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type ViewMode = 'map' | 'recipes';

const MAP_BASE_WIDTH = 365;
const MAP_BASE_HEIGHT = 434;
const MAP_WIDTH = 292;
const MAP_HEIGHT = (MAP_WIDTH * MAP_BASE_HEIGHT) / MAP_BASE_WIDTH;
const MAP_SCALE = MAP_WIDTH / MAP_BASE_WIDTH;

const REGIONS = [
  { name: '인천', fullName: '인천광역시', left: 70, top: 130 },
  { name: '경기도', fullName: '경기도', left: 112, top: 78 },
  { name: '강원도', fullName: '강원도', left: 182, top: 82 },
  { name: '서울', fullName: '서울특별시', left: 105, top: 105 },
  { name: '충북', fullName: '충청북도', left: 142, top: 160 },
  { name: '경북', fullName: '경상북도', left: 211, top: 190 },
  { name: '충남', fullName: '충청남도', left: 95, top: 185 },
  { name: '전북', fullName: '전라북도', left: 105, top: 242 },
  { name: '경남', fullName: '경상남도', left: 191, top: 267 },
  { name: '전라도', fullName: '전라도', left: 100, top: 295 },
  { name: '제주도', fullName: '제주도', left: 100, top: 375 },
  { name: '울릉도', fullName: '울릉도', left: 314, top: 150 },
  { name: '독도', fullName: '독도', left: 320, top: 238 },
];

const RECIPES = [
  {
    id: 1,
    title: '고들빼기김치',
    desc: '고들빼기김치고들빼기김치고들빼기김치고들빼기김치고들빼기김치고들빼기김치',
    author: '인자 할머니',
    done: false,
  },
  {
    id: 2,
    title: '고들빼기김치',
    desc: '고들빼기김치고들빼기김치고들빼기김치고들빼기김치고들빼기김치고들빼기김치',
    author: '인자 할머니',
    done: true,
  },
  {
    id: 3,
    title: '고들빼기김치',
    desc: '고들빼기김치고들빼기김치고들빼기김치고들빼기김치고들빼기김치고들빼기김치',
    author: '인자 할머니',
    done: false,
  },
];

const scaleMapPosition = (value: number) => value * MAP_SCALE;

export default function Map() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const selectedRegionLabel =
    REGIONS.find(region => region.fullName === selectedRegion || region.name === selectedRegion)?.fullName ??
    selectedRegion;

  const selectRegion = (regionName: string) => {
    setSelectedRegion(regionName);
    setRegionPickerOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FCFCFC" />

      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity activeOpacity={0.75}>
          <Image source={require('../assets/images/find_btn.png')} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.topTabs}>
        <TouchableOpacity
          style={styles.topTab}
          onPress={() => setViewMode('map')}
          activeOpacity={0.8}
        >
          <Text style={[styles.topTabText, viewMode === 'map' && styles.topTabTextActive]}>지도</Text>
          {viewMode === 'map' && <View style={styles.topTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topTab}
          onPress={() => setViewMode('recipes')}
          activeOpacity={0.8}
        >
          <Text style={[styles.topTabText, viewMode === 'recipes' && styles.topTabTextActive]}>
            지역별 레시피
          </Text>
          {viewMode === 'recipes' && <View style={styles.topTabIndicator} />}
        </TouchableOpacity>
      </View>

      {viewMode === 'map' ? (
        <View style={styles.mapScreen}>
          <View style={styles.mapWrap}>
            <Image
              source={require('../assets/images/map_noword.png')}
              style={styles.mapImage}
              resizeMode="contain"
            />
            {REGIONS.map(region => (
              <TouchableOpacity
                key={region.fullName}
                style={[
                  styles.regionBadge,
                  { left: scaleMapPosition(region.left), top: scaleMapPosition(region.top) },
                  selectedRegion === region.fullName && styles.regionBadgeSelected,
                ]}
                onPress={() => selectRegion(region.fullName)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.regionBadgeText,
                    selectedRegion === region.fullName && styles.regionBadgeTextSelected,
                  ]}
                >
                  {region.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedRegion && (
          <View style={styles.regionSheet}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity
                style={styles.sheetRegionButton}
                onPress={() => setRegionPickerOpen(open => !open)}
                activeOpacity={0.8}
              >
                <Text style={styles.sheetRegionText}>{selectedRegionLabel}</Text>
                <Text style={styles.sheetArrow}>{regionPickerOpen ? '⌃' : '⌄'}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setViewMode('recipes')} 
                activeOpacity={0.7}
              >
              <Text style={styles.sheetDetail}>자세히 보러가기</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetDesc}>
              고들빼기김치, 꼬막무침, 전주비빔밥, 홍어삼합, 추어탕처럼 깊은 손맛이 담긴 음식들이 전라도의 대표 음식입니다.
            </Text>

            {regionPickerOpen && (
              <View style={styles.sheetPicker}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {REGIONS.map(region => (
                    <TouchableOpacity
                      key={region.fullName}
                      style={[
                        styles.sheetPickerOption,
                        selectedRegion === region.fullName && styles.sheetPickerOptionSelected,
                      ]}
                      onPress={() => selectRegion(region.fullName)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.sheetPickerText,
                          selectedRegion === region.fullName && styles.sheetPickerTextSelected,
                        ]}
                      >
                        {region.fullName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.rankRow}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.rankRowScroll}
                style={{ flexGrow: 0 }} // 뷰가 불필요하게 늘어나지 않게 설정
              >
              <View style={[styles.rankCard, styles.rankFirst]}>
                <Text style={styles.rankLabel}>인기 레시피{'\n'}1위</Text>
                <View style={styles.medalCircle}>
                  <Image source={require('../assets/images/gold_medal.png')} style={styles.medalImage} />
                </View>
                <View style={styles.rankFooter}>
                  <Text style={styles.rankTitle}>고들빼기김치</Text>
                  <Text style={styles.rankDesc}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    쌉싸름한 고들빼기에 젓갈 양념을 더한 김치</Text>
                </View>
              </View>
              <View style={[styles.rankCard, styles.rankSecond]}>
                <Text style={styles.rankLabel}>인기 레시피{'\n'}2위</Text>
                <View style={styles.medalCircle}>
                  <Image source={require('../assets/images/silver_medal.png')} style={styles.medalImage} />
                </View>
                <View style={styles.rankFooter}>
                  <Text style={styles.rankTitle}>꼬막무침</Text>
                  <Text style={styles.rankDesc}>삶은 꼬막과 매콤새콤한 양념의 조화</Text>
                </View>
              </View>
              <View style={[styles.rankCard, styles.rankThird]}>
                <Text style={styles.rankLabel}>인기 레시피{'\n'}3위</Text>
                <View style={styles.medalCircle}>
                  <Image source={require('../assets/images/bronze_medal.png')} style={styles.medalImage} />
                </View>
                <View style={styles.rankFooter}>
                  <Text style={styles.rankTitle}>동태찌개</Text>
                  <Text style={styles.rankDesc}>칼칼하고 시원한 동태찌개</Text>
                </View>
              </View>
              </ScrollView>
            </View>
          </View>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.recipeScreen}
          contentContainerStyle={styles.recipeContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.selectedRegionCard}>
            <TouchableOpacity
              style={styles.recipeRegionButton}
              onPress={() => setRegionPickerOpen(open => !open)}
              activeOpacity={0.85}
            >
              <Text style={styles.recipeRegionText}>{selectedRegionLabel}</Text>
              <Text style={styles.recipeRegionArrow}>{regionPickerOpen ? '⌃' : '⌄'}</Text>
            </TouchableOpacity>
            <Text style={styles.selectedRegionDesc}>
              젓갈과 장, 제철 식재료가 어우러진 깊고 풍성한 남도의 맛
            </Text>

            {regionPickerOpen && (
              <View style={styles.recipePicker}>
                {REGIONS.map(region => (
                  <TouchableOpacity
                    key={region.fullName}
                    style={[
                      styles.recipePickerOption,
                      selectedRegion === region.fullName && styles.recipePickerOptionSelected,
                    ]}
                    onPress={() => selectRegion(region.fullName)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.recipePickerText,
                        selectedRegion === region.fullName && styles.recipePickerTextSelected,
                      ]}
                    >
                      {region.fullName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.sortRow}>
            <Text style={styles.sortText}>인기순 ⌄</Text>
          </View>

          {RECIPES.map(recipe => (
            <View key={`${selectedRegion}-${recipe.id}`} style={styles.recipeCard}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <Text style={styles.recipeDesc}>{recipe.desc}</Text>
              <View style={styles.recipeFooter}>
                <View style={styles.avatarPlaceholder} />
                <Text style={styles.authorText}>{recipe.author}</Text>
                {recipe.done && (
                  <View style={styles.doneBadge}>
                    <Text style={styles.doneText}>따라하기 완료</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  searchIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#8D8986',
  },
  topTabs: {
    height: 43,
    flexDirection: 'row',
    paddingHorizontal: 26,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  topTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTabText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 14,
    color: '#8D8986',
  },
  topTabTextActive: {
    color: '#FF9019',
  },
  topTabIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 2,
    backgroundColor: '#FF9019',
  },
  mapScreen: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 12,
  },
  mapWrap: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    marginTop: 58,
  },
  mapImage: {
    position: 'absolute',
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  },
  regionBadge: {
    position: 'absolute',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    transform: [{ scale: 0.82 }],
  },
  regionBadgeSelected: {
    backgroundColor: '#FFF2E4',
    borderWidth: 1,
    borderColor: '#FF9019',
  },
  regionBadgeText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 10,
    color: '#42403D',
  },
  regionBadgeTextSelected: {
    color: '#FF9019',
  },
  regionSheet: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 0,
    minHeight: 210,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    padding: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetRegionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sheetRegionText: {
    fontFamily: 'NanumHuman-EB',
    fontSize: 16,
    color: '#181818',
  },
  sheetArrow: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 17,
    color: '#181818',
  },
  sheetDetail: {
    fontFamily: 'NanumHuman-Regular',
    fontSize: 11,
    color: '#8D8986',
  },
  sheetDesc: {
    marginTop: 10,
    fontFamily: 'NanumHuman-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#42403D',
  },
  sheetPicker: {
    position: 'absolute',
    top: 42,
    left: 14,
    width: 128,
    maxHeight: 148,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    zIndex: 2,
    overflow: 'hidden',
  },
  sheetPickerOption: {
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  sheetPickerOptionSelected: {
    backgroundColor: '#FFF2E4',
  },
  sheetPickerText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 12,
    color: '#42403D',
  },
  sheetPickerTextSelected: {
    color: '#FF9019',
  },
  rankRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  rankCard: {
    width: 180,
    minHeight: 120,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,    // 카드 사이 간격
  },
  rankFirst: {
    backgroundColor: '#FF9019',
  },
  rankSecond: {
    backgroundColor: '#73ADFF',
  },
  rankThird: {
    backgroundColor: '#FFCA45',
  },
  rankLabel: {
    paddingHorizontal: 12,
    paddingTop: 13,
    fontFamily: 'NanumHuman-EB',
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  medalCircle: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  rankFooter: {
    marginTop: 'auto',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  rankTitle: {
    fontFamily: 'NanumHuman-EB',
    fontSize: 11,
    color: '#181818',
  },
  rankDesc: {
    marginTop: 4,
    fontFamily: 'NanumHuman-Regular',
    fontSize: 9,
    lineHeight: 13,
    color: '#827E7B',
  },
  recipeScreen: {
    flex: 1,
  },
  recipeContent: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 26,
  },
  selectedRegionCard: {
    borderRadius: 8,
    backgroundColor: '#FF9019',
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  recipeRegionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  recipeRegionText: {
    fontFamily: 'NanumHuman-EB',
    fontSize: 16,
    color: '#FFFFFF',
  },
  recipeRegionArrow: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  selectedRegionDesc: {
    marginTop: 8,
    width: '72%',
    fontFamily: 'NanumHuman-Regular',
    fontSize: 12,
    lineHeight: 17,
    color: '#FFFFFF',
  },
  recipePicker: {
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
  },
  recipePickerOption: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  recipePickerOptionSelected: {
    backgroundColor: '#FFF2E4',
  },
  recipePickerText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 12,
    color: '#42403D',
  },
  recipePickerTextSelected: {
    color: '#FF9019',
  },
  sortRow: {
    alignItems: 'flex-end',
    paddingTop: 18,
    paddingBottom: 12,
  },
  sortText: {
    fontFamily: 'NanumHuman-Regular',
    fontSize: 13,
    color: '#827E7B',
  },
  recipeCard: {
    minHeight: 118,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 17,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  // 스타일 추가 및 수정
rankRowScroll: {
  marginTop: 'auto',
  paddingBottom: 5, // 스크롤바가 콘텐츠에 가려지지 않게 여유 공간
},
recipeTitle: {
    fontFamily: 'NanumHuman-EB',
    fontSize: 17,
    color: '#181818',
  },
  recipeDesc: {
    marginTop: 8,
    fontFamily: 'NanumHuman-Regular',
    fontSize: 13,
    lineHeight: 19,
    color: '#827E7B',
  },
  recipeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  avatarPlaceholder: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#F1F1F1',
  },
  authorText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 13,
    color: '#181818',
  },
  doneBadge: {
    marginLeft: 'auto',
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFA23E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  doneText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});
