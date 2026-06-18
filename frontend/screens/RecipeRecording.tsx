import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { useState } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export default function RecipeRecording() {
  const navigation = useNavigation() as any;
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);

const startRecording = async () => {
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) return;
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
    }
  };

/*
const stopAndSend = async () => {
    if (!isRecording) {
      return;
    }
    await audioRecorder.stop();
    const uri = audioRecorder.uri;

    const formData = new FormData();
    formData.append('file', { uri, name: 'recording.m4a', type: 'audio/m4a' } as any);

    try {
      const res = await fetch(`${API_URL}/speech-to-text`, { method: 'POST', body: formData });
      const data = await res.json();
      navigation.navigate('RegionSelect', { transcript: data.text });
    } catch (e) {
      console.log('fetch 에러:', e);
    }
  };

  */

  const stopAndSend = async () => {
    if (!isRecording) return;
    await audioRecorder.stop();

    // 🧪 테스트용 - STT 스킵하고 바로 transcript 넘김
    const testTranscript = "오늘은 된장찌개 만드는 법을 알려드릴게요. 재료는 된장 두 큰술, 두부 반 모, 애호박 반 개, 감자 하나, 양파 반 개, 대파 조금, 멸치 육수 500밀리리터가 필요해요. 먼저 멸치 육수를 끓이고, 된장을 풀어줘요. 그다음 감자랑 양파를 먼저 넣고 5분 정도 끓이다가 두부랑 애호박 넣고 10분 더 끓이면 돼요. 마지막에 대파 넣고 불 끄면 완성이에요. 30분이면 충분해요.";
    navigation.navigate('RegionSelect', { transcript: testTranscript });
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
        <TouchableOpacity onPress={startRecording}>
          <View style={styles.micOuter}>
            <View style={styles.glowOuter} />
            <View style={styles.glowMiddle} />
            <View style={styles.micCircle}>
              <Image source={require('../assets/images/record_ing.png')} style={styles.micIcon} />
            </View>
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
  micOuter: { width: 180, height: 180, justifyContent: 'center', alignItems: 'center' },

  glowOuter: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#FFCA45', opacity: 0.1,
  },
  glowMiddle: {
    position: 'absolute',
    width: 133, height: 133, borderRadius: 67,
    backgroundColor: '#FFCA45', opacity: 0.2,
  },
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
});