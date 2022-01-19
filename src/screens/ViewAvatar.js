import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getAvatar, setFriend } from "../utils/firebase";
import { Image, Button } from "../components";
import { images } from "../utils/images";
import { Alert } from "react-native";

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
  justify-content: center;
  align-items: center;
  padding: 0 20px;
`;
const AvatarName = styled.Text`
  font-size: 25px;
`;

const ViewAvatar = ({ navigation, route: { params } }) => {
  const [avatar, setAvatar] = useState({
    id: params._id,
    name: params.name,
    photoUrl: images.photo,
  });

  useEffect(() => {
    navigation.setOptions({ headerTitle: params.name || "User" });
    async function getPhotoUrl() {
      const url = await getAvatar(params._id);
      setAvatar({ ...avatar, photoUrl: url });
    }
    getPhotoUrl();
  }, []);

  const _handleFriend = async () => {
    await setFriend(avatar);
  };

  return (
    <Container>
      <Image url={avatar.photoUrl} rounded />
      <AvatarName>{avatar.name}</AvatarName>
      <Button title="친구 추가" onPress={_handleFriend} isFilled={false} />
    </Container>
  );
};

export default ViewAvatar;
