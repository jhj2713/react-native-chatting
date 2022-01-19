import React, { useState, useEffect, useLayoutEffect, useContext } from "react";
import { firestore, createMessage, getCurrentUser } from "../utils/firebase";
import styled, { ThemeContext } from "styled-components/native";
import { Alert } from "react-native";
import { GiftedChat, Send } from "react-native-gifted-chat";
import { MaterialIcons } from "@expo/vector-icons";
import { uploadMessageImage } from "../utils/firebase";
import * as ImagePicker from "expo-image-picker";

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

const SendButton = (props) => {
  const theme = useContext(ThemeContext);

  return (
    <Send
      {...props}
      disabled={!props.text}
      containerStyle={{
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 4,
      }}
    >
      <MaterialIcons
        name="send"
        size={24}
        color={
          props.text ? theme.sendButtonActivate : theme.sendButtonInactivate
        }
      />
    </Send>
  );
};

const Channel = ({ navigation, route: { params } }) => {
  const theme = useContext(ThemeContext);
  const { uid, name, photoUrl } = getCurrentUser();

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore
      .collection("channels")
      .doc(params.id)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push(doc.data());
        });
        setMessages(list);
      });
    return () => unsubscribe();
  }, []);

  const _handlePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.cancelled) {
        await uploadMessageImage({ channelId: params.id, uri: result.uri });
      }
    } catch (e) {
      Alert.alert("Photo Error", e.message);
    }
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: params.title || "Channel",
      headerRight: () => (
        <MaterialIcons
          name="add-a-photo"
          size={26}
          style={{ margin: 10 }}
          onPress={_handlePhoto}
        />
      ),
    });
  }, []);

  const _handleMessageSend = async (messageList) => {
    const newMessage = messageList[0];
    try {
      await createMessage({ channelId: params.id, message: newMessage });
    } catch (e) {
      Alert.alert("Send Message Error: ", e.message);
    }
  };
  const _handleAvatarPress = (avatar) => {
    navigation.navigate("Avatar", avatar);
  };

  return (
    <Container>
      <GiftedChat
        listViewProps={{
          style: { backgroundColor: theme.background },
        }}
        placeholder="Enter a message"
        messages={messages}
        user={{ _id: uid, name, avatar: photoUrl }}
        onSend={_handleMessageSend}
        textInputProps={{
          autoCapitalize: "none",
          autoCorrect: false,
          textContentType: "none",
          underlineColorAndroid: "transparent",
        }}
        multiline={false}
        renderUsernameOnMessage={true}
        scrollToBottom={true}
        renderSend={(props) => <SendButton {...props} />}
        onPressAvatar={_handleAvatarPress}
      />
    </Container>
  );
};

export default Channel;
