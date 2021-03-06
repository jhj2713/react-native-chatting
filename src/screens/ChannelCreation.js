import React, { useState, useRef, useEffect, useContext } from "react";
import { Alert } from "react-native";
import { ProgressContext } from "../contexts";
import { createChannel } from "../utils/firebase";
import styled from "styled-components/native";
import { Input, Button } from "../components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
  justify-content: center;
  align-items: center;
  padding: 0 20px;
`;
const ErrorText = styled.Text`
  align-items: flex-start;
  width: 100%;
  height: 20px;
  margin-bottom: 10px;
  line-height: 20px;
  color: ${({ theme }) => theme.errorText};
`;

const ChannelCreation = ({ navigation }) => {
  const { spinner } = useContext(ProgressContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [disabled, setDisabled] = useState(true);

  const descriptionRef = useRef();

  useEffect(() => {
    setDisabled(!(title && !errorMessage));
  }, [title, description, errorMessage]);

  const _handleTitleChange = (title) => {
    setTitle(title);
    setErrorMessage(title.trim() ? "" : "Please enter the title");
  };
  const _handleCreationButtonPress = async () => {
    try {
      spinner.start();
      const id = await createChannel({ title, description });
      navigation.replace("Channel", { id, title });
    } catch (e) {
      Alert.alert("채팅방 만들기에 실패했습니다", "다시 시도해주세요");
    } finally {
      spinner.stop();
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flex: 1 }}
      extraScrollHeight={20}
    >
      <Container>
        <Input
          label="Title"
          value={title}
          onChangeText={_handleTitleChange}
          onSubmitEditing={() => {
            setTitle(title.trim());
            descriptionRef.current.focus();
          }}
          onBlur={() => setTitle(title.trim())}
          placeholder="Title"
          returnKeyType="next"
          maxLength={20}
        />
        <Input
          ref={descriptionRef}
          label="Description"
          value={description}
          onChangeText={(text) => setDescription(text)}
          onSubmitEditing={() => {
            setDescription(description.trim());
            _handleCreationButtonPress();
          }}
          onBlur={() => setDescription(description.trim())}
          placeholder="Description"
          returnKeyType="done"
          maxLength={40}
        />
        <ErrorText>{errorMessage}</ErrorText>
        <Button
          title="Create"
          onPress={_handleCreationButtonPress}
          disabled={disabled}
        />
      </Container>
    </KeyboardAwareScrollView>
  );
};

export default ChannelCreation;
