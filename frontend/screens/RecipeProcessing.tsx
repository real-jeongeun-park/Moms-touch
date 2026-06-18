import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import Svg, { Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

const AnimatedGradient = Animated.createAnimatedComponent(SvgLinearGradient);

// 기본 진한 주황색 글씨 위로 옅은색 하이라이트가 지나가는 그라데이션 텍스트
function ShimmerText({
  text,
  fontSize = 18,
  fontWeight = '700',
  baseColor = '#FF9019',
  highlightColor = '#FFE2BE',
}: {
  text: string;
  fontSize?: number;
  fontWeight?: string;
  baseColor?: string;
  highlightColor?: string;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: false, // SVG 그라데이션 속성은 네이티브 드라이버 미지원
      })
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  // 폭 100%짜리 하이라이트 밴드가 왼쪽 밖 → 오른쪽 밖으로 이동
  const x1 = progress.interpolate({ inputRange: [0, 1], outputRange: ['-100%', '100%'] });
  const x2 = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '200%'] });

  return (
    <View>
      {/* 레이아웃 크기 측정용 (투명) */}
      <Text
        style={{ fontSize, fontWeight: fontWeight as any, opacity: 0 }}
        onLayout={(e) => setSize(e.nativeEvent.layout)}
      >
        {text}
      </Text>

      {size.width > 0 && (
        <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill}>
          <Defs>
            <AnimatedGradient id="shimmer" x1={x1 as any} y1="0" x2={x2 as any} y2="0">
              <Stop offset="0" stopColor={baseColor} />
              <Stop offset="0.5" stopColor={highlightColor} />
              <Stop offset="1" stopColor={baseColor} />
            </AnimatedGradient>
          </Defs>
          <SvgText
            fill="url(#shimmer)"
            fontSize={fontSize}
            fontWeight={fontWeight}
            x={size.width / 2}
            y={size.height / 2 + fontSize * 0.35}
            textAnchor="middle"
          >
            {text}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}

export default function RecipeProcessing() {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  const { transcript, region } = route.params;

  useEffect(() => {
    const generate = async () => {
      try {
        const res = await fetch(`${API_URL}/generate-recipe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript, region }),
        });
        const data = await res.json();
        console.log(data);
        
        navigation.navigate('RecipeReview', { recipe: data });
      } catch (e) {
        console.log('레시피 생성 에러:', e);
      }
    };

    generate();
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      {/* 뒤로가기 */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Image source={require('../assets/images/back.png')} style={styles.backIcon} />
      </TouchableOpacity>

      {/* 타이틀 */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>거의 다 됐어요!</Text>
        <Text style={styles.subtitle}>손맛을 레시피로 옮기는 중이에요</Text>
      </View>

      {/* 할머니 이미지 */}
      <View style={styles.imageSection}>
        <Image
          source={require('../assets/images/grandma_talk.png')}
          style={styles.grandmaImage}
          resizeMode="contain"
        />
      </View>

      {/* 손맛 변환 중 */}
      <View style={styles.statusRow}>
        <ShimmerText text="손맛 변환 중" fontSize={18} fontWeight="700" />
        <Image source={require('../assets/images/twinkle.png')} style={styles.twinkleIcon} />
      </View>

      {/* 취소하기 */}
      <View style={{ flex: 1 }} />
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => navigation.navigate('Main')}
        activeOpacity={0.7}
      >
        <Text style={styles.cancelText}>취소하기</Text>
        <View style={styles.cancelUnderline} />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },

  backBtn: { marginTop: 17, marginLeft: 28, padding: 4, width: 28, height: 28, justifyContent: 'center' },
  backIcon: { width: 20, height: 20, resizeMode: 'contain' },

  titleSection: {
    marginTop: 40, paddingHorizontal: 28,
    alignItems: 'center', gap: 9,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#181818', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#8D8986', textAlign: 'center' },

  imageSection: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 48,
    height: 310,
  },
  grandmaImage: { width: 349, height: 302 },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  statusText: {
    fontSize: 18, fontWeight: '700',
    color: '#FF9019',
  },
  twinkleIcon: { width: 20, height: 24, resizeMode: 'contain' },

  cancelBtn: {
    alignItems: 'center',
    marginBottom: 100,
  },
  cancelText: { fontSize: 15, color: '#827E7B' },
  cancelUnderline: { width: 54, height: 1, backgroundColor: '#827E7B', marginTop: 2 },
});
