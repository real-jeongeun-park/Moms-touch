import { useState, useEffect, useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

type ViewMode = 'map' | 'recipes';

const MAP_BASE_WIDTH = 365;
const MAP_BASE_HEIGHT = 434;
const MAP_ASPECT = MAP_BASE_WIDTH / MAP_BASE_HEIGHT;
const MAP_INSET = 16;

const REGIONS = [
  { name: '인천',   fullName: '인천광역시', left: 70,  top: 130 },
  { name: '경기도', fullName: '경기도',     left: 112, top: 78  },
  { name: '강원도', fullName: '강원도',     left: 182, top: 82  },
  { name: '서울',   fullName: '서울특별시', left: 105, top: 105 },
  { name: '충북',   fullName: '충청북도',   left: 142, top: 160 },
  { name: '경북',   fullName: '경상북도',   left: 211, top: 190 },
  { name: '충남',   fullName: '충청남도',   left: 95,  top: 185 },
  { name: '전북',   fullName: '전라북도',   left: 105, top: 242 },
  { name: '경남',   fullName: '경상남도',   left: 191, top: 267 },
  { name: '전라도', fullName: '전라도',     left: 100, top: 295 },
  { name: '제주도', fullName: '제주도',     left: 100, top: 375 },
  { name: '울릉도', fullName: '울릉도',     left: 314, top: 150 },
  { name: '독도',   fullName: '독도',       left: 320, top: 238 },
];

const RANK_COLORS = ['#FF9019', '#73ADFF', '#FFCA45'];
const RANK_MEDALS = [
  require('../assets/images/gold_medal.png'),
  require('../assets/images/silver_medal.png'),
  require('../assets/images/bronze_medal.png'),
];

export default function Map() {
  const navigation = useNavigation() as any;
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const [mapArea, setMapArea] = useState({ width: 0, height: 0 });
  const [recipes, setRecipes] = useState<any[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const availWidth = Math.max(0, mapArea.width - MAP_INSET * 2);
  const availHeight = Math.max(0, mapArea.height - MAP_INSET * 2);
  const mapWidth =
    availWidth > 0 && availHeight > 0 ? Math.min(availWidth, availHeight * MAP_ASPECT) : 0;
  const mapHeight = mapWidth / MAP_ASPECT;
  const mapScale = mapWidth / MAP_BASE_WIDTH;

  const selectedRegionLabel =
    REGIONS.find(r => r.fullName === selectedRegion)?.fullName ?? selectedRegion ?? '';

  const selectRegion = (regionName: string) => {
    setSelectedRegion(regionName);
    setRegionPickerOpen(false);
  };

  // 포커스될 때마다 유저 팔로우 목록 로드
  useFocusEffect(useCallback(() => {
    const loadFollowed = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user) return;
        const res = await fetch(`${API_URL}/users/${user.id}/recipes/followed`, {
          headers: { 'ngrok-skip-browser-warning': '1' },
        });
        const data = await res.json();
        setFollowedIds(new Set((data.recipes ?? []).map((r: any) => r.id)));
      } catch (e) {
        console.log('팔로우 목록 로드 에러:', e);
      }
    };
    loadFollowed();
  }, []));

  // 지역 선택 시 레시피 fetch
  useEffect(() => {
    if (!selectedRegion) return;
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/recipes?region=${encodeURIComponent(selectedRegion)}`,
          { headers: { 'ngrok-skip-browser-warning': '1' } }
        );
        const data = await res.json();
        setRecipes(data.recipes ?? []);
      } catch (e) {
        console.log('레시피 로드 에러:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [selectedRegion]);

  const top3 = recipes.slice(0, 3);

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
        <TouchableOpacity style={styles.topTab} onPress={() => setViewMode('map')} activeOpacity={0.8}>
          <Text style={[styles.topTabText, viewMode === 'map' && styles.topTabTextActive]}>지도</Text>
          {viewMode === 'map' && <View style={styles.topTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.topTab} onPress={() => setViewMode('recipes')} activeOpacity={0.8}>
          <Text style={[styles.topTabText, viewMode === 'recipes' && styles.topTabTextActive]}>
            지역별 레시피
          </Text>
          {viewMode === 'recipes' && <View style={styles.topTabIndicator} />}
        </TouchableOpacity>
      </View>

      {viewMode === 'map' ? (
        <View style={styles.mapScreen}>
          <View
            style={styles.mapArea}
            onLayout={e => {
              const { width, height } = e.nativeEvent.layout;
              setMapArea(prev =>
                prev.width === width && prev.height === height ? prev : { width, height }
              );
            }}
          >
            {mapWidth > 0 && (
              <View style={[styles.mapWrap, { width: mapWidth, height: mapHeight }]}>
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
                      { left: region.left * mapScale, top: region.top * mapScale },
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
                      {region.fullName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
                <TouchableOpacity onPress={() => setViewMode('recipes')} activeOpacity={0.7}>
                  <Text style={styles.sheetDetail}>자세히 보러가기</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sheetDesc}>
                {recipes.length > 0
                  ? `${selectedRegionLabel} 레시피 ${recipes.length}개가 등록되어 있어요`
                  : `${selectedRegionLabel}에 아직 등록된 레시피가 없어요`}
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

              {loading ? (
                <ActivityIndicator color="#FF9019" style={{ marginTop: 20 }} />
              ) : top3.length > 0 ? (
                <View style={styles.rankRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rankRowScroll}>
                    {top3.map((item, index) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.rankCard, { backgroundColor: RANK_COLORS[index] }]}
                        onPress={() => navigation.navigate('RecipeDetail', { recipe_id: item.id })}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.rankLabel}>인기 레시피{'\n'}{index + 1}위</Text>
                        <View style={styles.medalCircle}>
                          <Image source={RANK_MEDALS[index]} style={styles.medalImage} />
                        </View>
                        <View style={styles.rankFooter}>
                          <Text style={styles.rankTitle}>{item.title}</Text>
                          <Text style={styles.rankDesc} numberOfLines={1}>{item.description}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
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
              <Text style={styles.recipeRegionText}>
                {selectedRegionLabel || '지역을 선택하세요'}
              </Text>
              <Text style={styles.recipeRegionArrow}>{regionPickerOpen ? '⌃' : '⌄'}</Text>
            </TouchableOpacity>
            <Text style={styles.selectedRegionDesc}>
              {selectedRegion
                ? `${selectedRegionLabel}의 손맛 레시피`
                : '지도에서 지역을 먼저 선택해주세요'}
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
            <Text style={styles.sortText}>최신순</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#FF9019" style={{ marginTop: 32 }} />
          ) : !selectedRegion ? (
            <Text style={styles.emptyText}>지도 탭에서 지역을 선택해주세요</Text>
          ) : recipes.length === 0 ? (
            <Text style={styles.emptyText}>이 지역에 아직 등록된 레시피가 없어요</Text>
          ) : (
            recipes.map(recipe => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => navigation.navigate('RecipeDetail', { recipe_id: recipe.id })}
                activeOpacity={0.85}
              >
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.recipeDesc} numberOfLines={2}>{recipe.description}</Text>
                <View style={styles.recipeFooter}>
                  <TouchableOpacity
                    style={styles.authorTap}
                    onPress={() =>
                      navigation.navigate('UserProfile', {
                        name: recipe.author ?? recipe.region,
                        region: selectedRegionLabel,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.avatarPlaceholder} />
                    <Text style={styles.authorText}>{recipe.author ?? recipe.region}</Text>
                  </TouchableOpacity>
                  {followedIds.has(recipe.id) && (
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneText}>따라하기 완료</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
  },
  headerSpacer: { width: 24, height: 24 },
  searchIcon: { width: 20, height: 20, resizeMode: 'contain', tintColor: '#8D8986' },
  topTabs: {
    height: 43,
    flexDirection: 'row',
    paddingHorizontal: 26,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  topTab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topTabText: { fontFamily: 'NanumHuman-Bold', fontSize: 14, color: '#8D8986' },
  topTabTextActive: { color: '#FF9019' },
  topTabIndicator: {
    position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, backgroundColor: '#FF9019',
  },
  mapScreen: { flex: 1, paddingBottom: 12 },
  mapArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapWrap: { position: 'relative' },
  mapImage: { position: 'absolute', width: '100%', height: '100%' },
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
  regionBadgeSelected: { backgroundColor: '#FFF2E4', borderWidth: 1, borderColor: '#FF9019' },
  regionBadgeText: { fontFamily: 'NanumHuman-Bold', fontSize: 8, color: '#42403D' },
  regionBadgeTextSelected: { color: '#FF9019' },
  regionSheet: {
    marginHorizontal: 18,
    minHeight: 210,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    padding: 14,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetRegionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sheetRegionText: { fontFamily: 'NanumHuman-EB', fontSize: 16, color: '#181818' },
  sheetArrow: { fontFamily: 'NanumHuman-Bold', fontSize: 17, color: '#181818' },
  sheetDetail: { fontFamily: 'NanumHuman-Regular', fontSize: 11, color: '#8D8986' },
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
  sheetPickerOption: { height: 34, justifyContent: 'center', paddingHorizontal: 10 },
  sheetPickerOptionSelected: { backgroundColor: '#FFF2E4' },
  sheetPickerText: { fontFamily: 'NanumHuman-Bold', fontSize: 12, color: '#42403D' },
  sheetPickerTextSelected: { color: '#FF9019' },
  rankRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  rankRowScroll: { paddingBottom: 5 },
  rankCard: {
    width: 180,
    minHeight: 120,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
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
  medalImage: { width: 48, height: 48, resizeMode: 'contain' },
  rankFooter: {
    marginTop: 'auto',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  rankTitle: { fontFamily: 'NanumHuman-EB', fontSize: 11, color: '#181818' },
  rankDesc: {
    marginTop: 4,
    fontFamily: 'NanumHuman-Regular',
    fontSize: 9,
    lineHeight: 13,
    color: '#827E7B',
  },
  recipeScreen: { flex: 1 },
  recipeContent: { paddingHorizontal: 28, paddingTop: 12, paddingBottom: 26 },
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
  recipeRegionText: { fontFamily: 'NanumHuman-EB', fontSize: 16, color: '#FFFFFF' },
  recipeRegionArrow: { fontFamily: 'NanumHuman-Bold', fontSize: 17, color: '#FFFFFF' },
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
  recipePickerOption: { height: 32, justifyContent: 'center', paddingHorizontal: 10 },
  recipePickerOptionSelected: { backgroundColor: '#FFF2E4' },
  recipePickerText: { fontFamily: 'NanumHuman-Bold', fontSize: 12, color: '#42403D' },
  recipePickerTextSelected: { color: '#FF9019' },
  sortRow: { alignItems: 'flex-end', paddingTop: 18, paddingBottom: 12 },
  sortText: { fontFamily: 'NanumHuman-Regular', fontSize: 13, color: '#827E7B' },
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
  recipeTitle: { fontFamily: 'NanumHuman-EB', fontSize: 17, color: '#181818' },
  recipeDesc: {
    marginTop: 8,
    fontFamily: 'NanumHuman-Regular',
    fontSize: 13,
    lineHeight: 19,
    color: '#827E7B',
  },
  recipeFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  authorTap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarPlaceholder: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#F1F1F1' },
  authorText: { fontFamily: 'NanumHuman-Bold', fontSize: 13, color: '#181818' },
  doneBadge: {
    marginLeft: 'auto',
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFA23E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  doneText: { fontFamily: 'NanumHuman-Bold', fontSize: 10, color: '#FFFFFF' },
  emptyText: {
    fontFamily: 'NanumHuman-Regular',
    fontSize: 14,
    color: '#9B9794',
    textAlign: 'center',
    marginTop: 40,
  },
});
