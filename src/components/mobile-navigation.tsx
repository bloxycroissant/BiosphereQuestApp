import { Href, Slot, router, usePathname } from 'expo-router';
import { Image, type ImageProps } from 'expo-image';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

const homeIcon = require('../../assets/BiosphereQuestAssets/Home Icon.png');
const coursesIcon = require('../../assets/BiosphereQuestAssets/Courses Icon.png');
const gamesIcon = require('../../assets/BiosphereQuestAssets/Games Icon.png');
const profileIcon = require('../../assets/BiosphereQuestAssets/Profile Icon.png');

const tabs = [
  { label: 'Home', route: '/home', icon: homeIcon },
  { label: 'Courses', route: '/explore', icon: coursesIcon },
  { label: 'Games', route: '/games', icon: gamesIcon },
  { label: 'Profile', route: '/profile', icon: profileIcon },
] as const;

export default function MobileNavigation() {
  const pathname = usePathname();
  const [entrance] = useState(() => new Animated.Value(0));

  useEffect(() => {
    entrance.setValue(0);
    Animated.spring(entrance, { toValue: 1, useNativeDriver: true, tension: 55, friction: 9 }).start();
  }, [entrance, pathname]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.page,
          {
            opacity: entrance,
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Slot />
      </Animated.View>

      <View style={styles.navigation}>
        {tabs.map((tab) => {
          const active = pathname === tab.route;
          return (
            <NavigationItem
              key={tab.route}
              label={tab.label}
              icon={tab.icon}
              active={active}
              onPress={() => router.replace(tab.route as Href)}
            />
          );
        })}
      </View>
    </View>
  );
}

function NavigationItem({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: NonNullable<ImageProps['source']>;
  active: boolean;
  onPress: () => void;
}) {
  const [motion] = useState(() => new Animated.Value(active ? 1 : 0));

  useEffect(() => {
    Animated.spring(motion, { toValue: active ? 1 : 0, useNativeDriver: true, tension: 70, friction: 8 }).start();
  }, [active, motion]);

  const iconScale = motion.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.04] });
  const iconLift = motion.interpolate({ inputRange: [0, 1], outputRange: [2, -1] });

  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Animated.View style={[styles.activeBackground, { opacity: motion }]} />
      <Animated.View style={{ transform: [{ scale: iconScale }, { translateY: iconLift }] }}>
        <Image source={icon} style={styles.icon} contentFit="contain" />
      </Animated.View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { flex: 1 },
  navigation: {
    backgroundColor: '#050505',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
    borderRadius: 24,
    position: 'relative',
  },
  activeBackground: { ...StyleSheet.absoluteFill, backgroundColor: '#003d3d', borderRadius: 24 },
  icon: { width: 28, height: 28 },
  label: { color: '#a9dcff', fontSize: 12, fontWeight: '700', marginTop: 3 },
});