import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export default function RecipeRecording() {
  const navigation = useNavigation() as any;
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);

  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;

  // 하나의 물결이 가운데서 시작해 바깥으로 퍼지며 사라지는 루프
  const createWave = (anim: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

  // 0 -> 1 진행에 따라 커지면서(scale) 옅어짐(opacity)
  const createScale = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 2.4],
    });

  const createOpacity = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    });

  const scale1 = createScale(pulseAnim1);
  const scale2 = createScale(pulseAnim2);
  const scale3 = createScale(pulseAnim3);

  const opacity1 = createOpacity(pulseAnim1);
  const opacity2 = createOpacity(pulseAnim2);
  const opacity3 = createOpacity(pulseAnim3);

  useEffect(() => {
    // 화면에 들어오면 바로 물결을 시차를 두고 계속 퍼지게 한다
    const wave1 = createWave(pulseAnim1, 0);
    const wave2 = createWave(pulseAnim2, 600);
    const wave3 = createWave(pulseAnim3, 1200);

    wave1.start();
    wave2.start();
    wave3.start();

    return () => {
      wave1.stop();
      wave2.stop();
      wave3.stop();
    };
  }, []);

  const startRecording = async () => {
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        '마이크 권한이 필요해요',
        '레시피를 녹음하려면 마이크 접근을 허용해 주세요. 설정에서 권한을 켤 수 있어요.',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정 열기', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (e) {
      console.log('녹음 에러:', e);
      Alert.alert('녹음을 시작할 수 없어요', String(e));
    }
  };


  const stopAndSend = async () => {
    if (!isRecording) return;

    await audioRecorder.stop();

    // 애니메이션 중지
    setIsRecording(false);

    // 🧪 테스트용 - STT 스킵
    const testTranscript =
    "오늘은 된장찌개 만드는 법을 알려드릴게요. 재료는 된장 두 큰술, 두부 반 모, 애호박 반 개, 감자 하나, 양파 반 개, 대파 조금, 멸치 육수 500밀리리터가 필요해요. 먼저 멸치 육수를 끓이고, 된장을 풀어줘요. 그다음 감자랑 양파를 먼저 넣고 5분 정도 끓이다가 두부랑 애호박 넣고 10분 더 끓이면 돼요. 마지막에 대파 넣고 불 끄면 완성이에요. 30분이면 충분해요.";

    navigation.navigate('RegionSelect', {
    transcript: testTranscript,
    });
  };


  return (
    <SafeAreaView style={styles.container}>

      {/* 뒤로가기 */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Image source={require('../assets/images/back.png')} style={styles.backIcon} />
      </TouchableOpacity>

      {/* 타이틀 */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>레시피 말하는 중</Text>
        <Text style={styles.subtitle}>말씀하신 내용을 차근차근 기록하고 있어요</Text>
      </View>

      {/* 마이크 버튼 (녹음 중 상태) */}
      <View style={styles.micWrapper}>
      <TouchableOpacity
        onPress={!isRecording ? startRecording : undefined}
        activeOpacity={0.8}
      >
        <View style={styles.micOuter}>
          {isRecording && (
            <>
              <Animated.View
                style={[
                  styles.wave,
                  {
                    opacity: opacity1,
                    transform: [{ scale: scale1 }],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.wave,
                  {
                    opacity: opacity2,
                    transform: [{ scale: scale2 }],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.wave,
                  {
                    opacity: opacity3,
                    transform: [{ scale: scale3 }],
                  },
                ]}
              />
            </>
          )}

          <Image
            source={require('../assets/images/record_img.png')}
            style={styles.recordButton}
          />
        </View>
      </TouchableOpacity>
    </View>

      {/* 하단 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.endBtn} onPress={stopAndSend}>
          <Text style={styles.endBtnText}>레시피 말하기 끝내기</Text>
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
    marginTop: 40, paddingHorizontal: 28,
    alignItems: 'center', gap: 9,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#181818', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#8D8986', textAlign: 'center' },

  micWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  micCircle: {
    width: 98, height: 98, borderRadius: 100,
    backgroundColor: '#FF9019',
    justifyContent: 'center', alignItems: 'center',
  },
  micIcon: { width: 58, height: 58, resizeMode: 'contain' },

  bottomBar: { paddingHorizontal: 28, paddingBottom: 104 },
  endBtn: {
    backgroundColor: '#FFA23E', borderRadius: 15,
    height: 60, justifyContent: 'center', alignItems: 'center',
  },
  endBtnText: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
 
  micOuter: {
  width: 220,
  height: 220,
  justifyContent: 'center',
  alignItems: 'center',
  },

  wave: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#FFB23E',
  },

  recordButton: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});