import { useState } from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

type ChatPage = 'intro' | 'chat';
type Message = { id: number; text: string; from: 'user' | 'bot' };

const getRecipeName = (text: string) =>
  text
    .replace(/에\s*대해.*/, '')
    .replace(/를\s*적.*/, '')
    .replace(/을\s*적.*/, '')
    .replace(/만들.*/, '')
    .trim();

const getAiReply = (userText: string, userMessageCount: number, recipeName: string) => {
  if (userMessageCount === 1) {
    const target = getRecipeName(userText) || userText;
    return `좋아요. ${target}에 들어가는 재료를 알려주세요. 정확한 양을 몰라도 괜찮아요.`;
  }

  if (userMessageCount === 2) {
    return `${userText}는 어떻게 준비하나요?`;
  }

  if (userMessageCount === 3) {
    return '그다음 과정은 어떻게 진행되나요?';
  }

  if (userMessageCount === 4) {
    return '불 조절이나 끓이는 시간은 어느 정도였나요?';
  }

  if (userMessageCount === 5) {
    return `${recipeName || '이 레시피'}를 더 맛있게 만드는 팁이 있다면 알려주세요.`;
  }

  return '좋아요. 더 기억나는 재료나 과정이 있으면 이어서 적어주세요.';
};

export default function RecipeChat() {
  const navigation = useNavigation() as any;
  const [page, setPage] = useState<ChatPage>('intro');
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipeName, setRecipeName] = useState('');
  const [input, setInput] = useState('');

  const sendMessage = () => {
    const text = input.trim();
    if (!text) {
      return;
    }

    Keyboard.dismiss();
    setPage('chat');
    setInput('');

    setMessages(prev => {
      const userMessageCount = prev.filter(message => message.from === 'user').length + 1;
      const nextRecipeName = userMessageCount === 1 ? getRecipeName(text) || text : recipeName;
      const aiReply = getAiReply(text, userMessageCount, nextRecipeName);

      if (userMessageCount === 1) {
        setRecipeName(nextRecipeName);
      }

      return [
        ...prev,
        { id: Date.now(), text, from: 'user' },
        { id: Date.now() + 1, text: aiReply, from: 'bot' },
      ];
    });
  };

  const completeChat = () => {
    Keyboard.dismiss();
    
    const transcript = messages
      .filter(m => m.from === 'user')
      .map(m => m.text)
      .join(' ');

    navigation.navigate('RegionSelect', { transcript });
  };

  return (
    <SafeAreaView style={styles.container}>
      {page === 'intro' && (
        <ImageBackground
          source={require('../assets/images/background2.png')}
          style={styles.topBackground}
          resizeMode="cover"
        />
      )}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Image source={require('../assets/images/back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        {page === 'chat' ? (
          <TouchableOpacity style={styles.doneBtn} onPress={completeChat} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>완료</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.dismissArea}>
            {page === 'intro' ? (
              <View style={styles.introBody}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>재료나 과정을 편하게 적어주세요</Text>
            <Text style={styles.subtitle}>평소 요리하듯 편하게 알려주세요</Text>
          </View>

          <View style={styles.promptArea}>
              <TouchableOpacity
                style={[styles.promptChip, styles.promptOrange]}
                onPress={() => setInput('과정은 이렇게 정리하고 싶어요')}
                activeOpacity={0.85}
              >
              <Text style={styles.promptText}>과정은 이렇게!!</Text>
            </TouchableOpacity>

            <View style={styles.promptRow}>
              <TouchableOpacity
                style={[styles.promptChip, styles.promptYellow]}
                onPress={() => setInput('재료는 이걸로 적을게요')}
                activeOpacity={0.85}
              >
                <Text style={styles.promptText}>재료는 이걸로</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.promptChip, styles.promptBlue]}
                onPress={() => setInput('시간은 이 정도 걸려요')}
                activeOpacity={0.85}
              >
                <Text style={styles.promptText}>시간은 이정도</Text>
              </TouchableOpacity>
            </View>

            <Image source={require('../assets/images/grandma_memo.png')} style={styles.grandmaImage} />
          </View>
              </View>
            ) : (
              <View style={styles.chatBody}>
                <ScrollView
                  style={styles.messageList}
                  contentContainerStyle={styles.messageContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {messages.map(message => (
                    <View
                      key={message.id}
                      style={[styles.bubble, message.from === 'user' ? styles.userBubble : styles.botBubble]}
                    >
                      <Text style={[styles.bubbleText, message.from === 'user' && styles.userBubbleText]}>
                        {message.text}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.inputShell}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder={page === 'intro' ? '레시피 이름이 무엇인가요?' : '가라앉은 전분을 감자에 다시 넣고 반...'}
                  placeholderTextColor="#77716D"
                  multiline
                  blurOnSubmit
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.85}>
                  <Text style={styles.sendBtnText}>전송</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View style={styles.tabBar}>
        <TabItem icon={require('../assets/images/Home_empty.png')} label="홈" />
        <TabItem icon={require('../assets/images/map_empty.png')} label="손맛 보관함" />
        <TabItem icon={require('../assets/images/Recipe_full.png')} label="레시피 만들기" active />
        <TabItem icon={require('../assets/images/Mypage_empty.png')} label="마이페이지" />
      </View>
    </SafeAreaView>
  );
}

function TabItem({ icon, label, active }: { icon: any; label: string; active?: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Image source={icon} style={styles.tabIcon} />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },
  topBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 362 },
  keyboardArea: { flex: 1 },
  dismissArea: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 8,
  },
  backBtn: { width: 28, height: 28, justifyContent: 'center' },
  backIcon: { width: 20, height: 20, resizeMode: 'contain' },
  headerSpacer: { width: 58, height: 34 },
  doneBtn: {
    height: 34,
    minWidth: 58,
    borderRadius: 10,
    backgroundColor: '#FF9019',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  doneBtnText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  introBody: { flex: 1 },
  titleSection: {
    marginTop: 44,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: 'NanumHuman-EB',
    fontSize: 22,
    color: '#181818',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'NanumHuman-Regular',
    fontSize: 14,
    color: '#8D8986',
    textAlign: 'center',
  },
  promptArea: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 38,
  },
  promptRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 38,
    marginTop: 18,
  },
  promptChip: {
    height: 52,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  promptOrange: { backgroundColor: '#FF9019', minWidth: 88 },
  promptYellow: { backgroundColor: '#FFCA45', minWidth: 86 },
  promptBlue: { backgroundColor: '#73ADFF', minWidth: 86 },
  promptText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  grandmaImage: {
    width: 310,
    height: 310,
    resizeMode: 'contain',
    marginTop: -40,
  },
  chatBody: { flex: 1 },
  messageList: { flex: 1 },
  messageContent: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 22,
    gap: 16,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9E9E9',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF9019',
  },
  bubbleText: {
    fontFamily: 'NanumHuman-Regular',
    fontSize: 13,
    color: '#42403D',
    lineHeight: 19,
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  inputShell: {
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FCFCFC',
  },
  inputRow: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  input: {
    flex: 1,
    maxHeight: 88,
    paddingVertical: 10,
    fontFamily: 'NanumHuman-Regular',
    fontSize: 13,
    color: '#181818',
  },
  sendBtn: {
    height: 36,
    minWidth: 48,
    borderRadius: 18,
    backgroundColor: '#FFD7A0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  sendBtnText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 12,
    color: '#FF9019',
  },
  tabBar: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
    paddingBottom: 7,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  tabLabel: {
    fontFamily: 'NanumHuman-Regular',
    fontSize: 9,
    color: '#B8B8B8',
  },
  tabLabelActive: {
    color: '#FF9019',
  },
});
