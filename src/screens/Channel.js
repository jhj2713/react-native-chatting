import React from "react";
import styled from "styled-components/native";
import { Text } from "react-native";

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

const Channel = ({ route: { params } }) => {
  return (
    <Container>
      <Text style={{ fontSize: 24 }}>ID: {params?.id}</Text>
      <Text style={{ fontSize: 24 }}>TITLE: {params?.title}</Text>
    </Container>
  );
};

export default Channel;
