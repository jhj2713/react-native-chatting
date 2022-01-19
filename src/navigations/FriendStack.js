import React, { useContext } from "react";
import { ThemeContext } from "styled-components/native";
import { createStackNavigator } from "@react-navigation/stack";
import { FriendList, ViewAvatar } from "../screens";

const Stack = createStackNavigator();

const FriendStack = () => {
  const theme = useContext(ThemeContext);

  return (
    <Stack.Navigator
      initialRouteName="Friend List"
      screenOptions={{
        headerTitleAlign: "center",
        headerTintColor: theme.headerTintColor,
        cardStyle: { backgroundColor: theme.backgroundColor },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="Friend List" component={FriendList} />
      <Stack.Screen name="Avatar" component={ViewAvatar} />
    </Stack.Navigator>
  );
};

export default FriendStack;
