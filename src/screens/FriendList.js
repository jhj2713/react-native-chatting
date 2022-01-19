import React, { useEffect, useState } from "react";
import { firestore, getCurrentUser } from "../utils/firebase";
import { FlatList } from "react-native";
import styled from "styled-components/native";
import { Image } from "../components";

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;
const ItemContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.listBorder};
  padding: 15px 20px -10px 20px;
`;
const ItemName = styled.Text`
  font-size: 20px;
  padding: 0 0 20px 20px;
  font-weight: 600;
`;

const Item = React.memo(({ item: { id, name, photoUrl }, onPress }) => {
  return (
    <ItemContainer onPress={() => onPress({ _id: id, name, photo: photoUrl })}>
      <Image url={photoUrl} rounded small />
      <ItemName>{name}</ItemName>
    </ItemContainer>
  );
});

const FriendList = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const user = getCurrentUser();

  useEffect(() => {
    const unsubscribe = firestore
      .collection("user")
      .doc(user.uid)
      .collection("friends")
      .onSnapshot((snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push(doc.data());
        });
        setFriends(list);
      });
    return () => unsubscribe();
  }, []);

  const _handleItemPress = (params) => {
    navigation.navigate("Avatar", params);
  };

  return (
    <Container>
      <FlatList
        keyExtractor={(item) => item["id"]}
        data={friends}
        renderItem={({ item }) => (
          <Item item={item} onPress={_handleItemPress} />
        )}
        windowSize={3}
      />
    </Container>
  );
};

export default FriendList;
