import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  getAvatar,
  setFriend,
  checkFriend,
  deleteFriend,
} from "../utils/firebase";
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
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerTitle: params.name || "User" });
    async function getPhotoUrl() {
      const url = await getAvatar(params._id);
      setAvatar({ ...avatar, photoUrl: url });
    }
    async function checkIsFriend() {
      const check = await checkFriend(avatar.id);
      setIsFriend(check);
    }
    getPhotoUrl();
    checkIsFriend();
  }, []);

  const _handleFriendAdd = async () => {
    await setFriend(avatar);
    Alert.alert("친구 추가가 완료되었습니다");
    navigation.goBack();
  };
  const _handleFriendDelete = async () => {
    await deleteFriend(avatar.id);
    Alert.alert("친구 삭제가 완료되었습니다");
    navigation.goBack();
  };

  return (
    <Container>
      <Image url={avatar.photoUrl} rounded />
      <AvatarName>{avatar.name}</AvatarName>
      <Button
        title={isFriend ? "친구 삭제" : "친구 추가"}
        onPress={isFriend ? _handleFriendDelete : _handleFriendAdd}
        isFilled={false}
      />
    </Container>
  );
};

export default ViewAvatar;
