import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type TabType = 'made' | 'followed';

const REGIONS = [
  '서울특별시',
  '인천광역시',
  '경기도',
  '강원도',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주도',
  '울릉도',
  '독도',
];

const RECIPES = [
  {
    id: 1,
    title: '고들빼기김치',
    desc: '고들빼기김치고들빼기김치고들빼기김치고들빼기김치고들빼기김치고들빼기김치',
    author: '인자 할머니',
  },
  {
    id: 2,
    title: '고들빼기김치',
    desc: '고들빼기김치고들빼기김치고들빼기김치고들빼기김치고들빼기김치고들빼기김치',
    author: '인자 할머니',
  },
  {
    id: 3,
    title: '고들빼기김치',
    desc: '고들빼기김치고들빼기김치고들빼기김치고들빼기김치고들빼기김치고들빼기김치',
    author: '인자 할머니',
  },
];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('made');
  const [selectedRegion, setSelectedRegion] = useState('전라도');
  const [regionOpen, setRegionOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFA23E" />

      <View style={styles.hero}>
        <View style={styles.regionBlock}>
          <Text style={styles.regionLabel}>지역</Text>
          <TouchableOpacity
            style={styles.regionButton}
            onPress={() => setRegionOpen(open => !open)}
            activeOpacity={0.85}
          >
            <Text style={styles.regionText}>{selectedRegion}</Text>
            <Text style={styles.regionArrow}>{regionOpen ? '⌃' : '⌄'}</Text>
          </TouchableOpacity>
        </View>

        {regionOpen && (
          <View style={styles.regionMenu}>
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {REGIONS.map(region => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.regionOption,
                    selectedRegion === region && styles.regionOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedRegion(region);
                    setRegionOpen(false);
                  }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.regionOptionText,
                      selectedRegion === region && styles.regionOptionTextSelected,
                    ]}
                  >
                    {region}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
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
            <Text style={styles.name}>박씨할매</Text>
            <TouchableOpacity style={styles.editNameBtn} activeOpacity={0.75}>
              <Image source={require('../assets/images/edit.png')} style={styles.editNameIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsBox}>
            <StatItem label="레시피" value="9" />
            <View style={styles.statDivider} />
            <StatItem label="레시피 도전자" value="9" />
            <View style={styles.statDivider} />
            <StatItem label="구독자" value="9" />
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

        <View style={styles.cardList}>
          {RECIPES.map(recipe => (
            <View key={`${activeTab}-${recipe.id}`} style={styles.recipeCard}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <Text style={styles.recipeDesc}>{recipe.desc}</Text>
              <View style={styles.authorRow}>
                <View style={styles.avatarPlaceholder} />
                <Text style={styles.authorText}>{recipe.author}</Text>
              </View>
            </View>
          ))}
        </View>
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
    justifyContent: 'center',
    paddingHorizontal: 28,
    zIndex: 10,
  },
  regionBlock: {
    gap: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  regionLabel: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  regionButton: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  regionText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  regionArrow: {
    marginTop: 1,
    fontFamily: 'NanumHuman-Bold',
    fontSize: 19,
    color: '#FFFFFF',
  },
  regionMenu: {
    position: 'absolute',
    left: 28,
    top: 78,
    width: 132,
    maxHeight: 238,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    overflow: 'hidden',
  },
  regionOption: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  regionOptionSelected: {
    backgroundColor: '#FFF2E4',
  },
  regionOptionText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 13,
    color: '#42403D',
  },
  regionOptionTextSelected: {
    color: '#FF9019',
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
    gap: 8,
    marginTop: 11,
  },
  name: {
    fontFamily: 'NanumHuman-EB',
    fontSize: 20,
    color: '#181818',
  },
  editNameBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editNameIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: '#8D8986',
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F1F1',
  },
  authorText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 14,
    color: '#181818',
  },
});
