import React, { useState, useEffect, useLayoutEffect } from "react";
import { firestore } from "../utils/firebase";
import styled from "styled-components/native";
import { Text, FlatList } from "react-native";

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

const Channel = ({ navigation, route: { params } }) => {
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

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: params.title || "Channel" });
  }, []);

  return (
    <Container>
      <FlatList
        keyExtractor={(item) => item["id"]}
        data={messages}
        renderItem={({ item }) => (
          <Text style={{ fontSize: 24 }}>{item.text}</Text>
        )}
      />
    </Container>
  );
};

export default Channel;
