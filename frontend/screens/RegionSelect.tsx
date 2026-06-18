import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';

// left, top = 365x434 기준 배지 좌측 상단 위치
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

export default function RegionSelect() {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;           
  const transcript = route.params?.transcript; 
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>

      {/* 뒤로가기 */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Image source={require('../assets/images/back.png')} style={styles.backIcon} />
      </TouchableOpacity>

      {/* 타이틀 */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>지역을 선택해주세요</Text>
        <Text style={styles.subtitle}>손맛이 담긴 레시피가 등록될 지역을 골라주세요</Text>
      </View>

      {/* 지도 */}
      <View style={styles.mapSection}>
        <View style={styles.mapContainer}>
          <Image
            source={require('../assets/images/map_noword.png')}
            style={styles.mapImage}
            resizeMode="contain"
          />
          {REGIONS.map(r => (
            <TouchableOpacity
              key={r.fullName}
              style={[
                styles.badge,
                { left: r.left, top: r.top },
                selected === r.fullName && styles.badgeSelected,
              ]}
              onPress={() => setSelected(r.fullName)}
              activeOpacity={0.75}
            >
              <Text style={[styles.badgeText, selected === r.fullName && styles.badgeTextSelected]}>
                {r.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => navigation.navigate('RecipeProcessing', {
            transcript,
            region: selected ?? '',
          })}
        >
          <Text style={styles.confirmBtnText}>레시피 완성하기</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },

  backBtn: { marginTop: 17, marginLeft: 28, padding: 4, width: 28, height: 28, justifyContent: 'center' },
  backIcon: { width: 20, height: 20, resizeMode: 'contain' },

  titleSection: {
    marginTop: 30, paddingHorizontal: 28,
    alignItems: 'center', gap: 9,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#181818', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#8D8986', textAlign: 'center' },

  mapSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  mapContainer: {
    width: 365,
    height: 434,
  },
  mapImage: {
    position: 'absolute',
    width: 365,
    height: 434,
  },

  badge: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  badgeSelected: {
    backgroundColor: '#FFF2E4',
    borderWidth: 1,
    borderColor: '#FFA23E',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3D3B3A',
  },
  badgeTextSelected: {
    color: '#FF9019',
    fontWeight: '700',
  },

  bottomBar: { paddingHorizontal: 28, paddingBottom: 104 },
  confirmBtn: {
    backgroundColor: '#FFA23E', borderRadius: 15,
    height: 60, justifyContent: 'center', alignItems: 'center',
  },
  confirmBtnText: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
});
