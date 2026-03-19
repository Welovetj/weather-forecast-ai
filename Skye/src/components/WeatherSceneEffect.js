import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Easing } from 'react-native';

/**
 * WeatherSceneEffect Component
 * Renders animated weather scene effects (lightning, snow, etc.) in the hero card
 */
const WeatherSceneEffect = ({ weatherData, style }) => {
  const { width, height } = useWindowDimensions();
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const snowDrift = useRef(new Animated.Value(0)).current;

  const weatherId = weatherData?.weather?.[0]?.id;
  const isThunderstorm = typeof weatherId === 'number' && weatherId >= 200 && weatherId < 300;
  const isSnow = typeof weatherId === 'number' && weatherId >= 600 && weatherId < 700;
  const isRain = typeof weatherId === 'number' && weatherId >= 300 && weatherId < 600;

  // Lightning flash animation for storms
  useEffect(() => {
    if (!isThunderstorm) return undefined;

    let lastFlashTime = 0;

    const triggerFlash = () => {
      const now = Date.now();
      if (now - lastFlashTime < 3000) return;

      lastFlashTime = now;

      Animated.sequence([
        Animated.timing(flashOpacity, {
          toValue: 0.8,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.delay(200),
        Animated.timing(flashOpacity, {
          toValue: 0.6,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const interval = setInterval(triggerFlash, 4000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [isThunderstorm, flashOpacity]);

  // Snow drift animation
  useEffect(() => {
    if (!isSnow) return undefined;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(snowDrift, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(snowDrift, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => loop.stop();
  }, [isSnow, snowDrift]);

  // Render snowflakes
  const snowflakes = Array.from({ length: isSnow ? 12 : 0 }, (_, i) => {
    const xOffset = snowDrift.interpolate({
      inputRange: [0, 1],
      outputRange: [Math.random() * -20 - 10, Math.random() * 20 + 10],
    });

    return (
      <Animated.View
        key={`snowflake-${i}`}
        style={[
          styles.snowflake,
          {
            left: `${(i / 12) * 100}%`,
            top: `${(i % 3) * 30}%`,
            opacity: 0.6,
            transform: [{ translateX: xOffset }],
          },
        ]}
      />
    );
  });

  // Render rain streaks
  const rainStreaks = Array.from({ length: isRain ? 8 : 0 }, (_, i) => {
    const yOffset = Animated.loop(
      Animated.timing(new Animated.Value(0), {
        toValue: 1,
        duration: 800 + i * 100,
        useNativeDriver: true,
      }),
    );

    return (
      <View
        key={`rain-${i}`}
        style={[
          styles.rainStreak,
          {
            left: `${(i / 8) * 100}%`,
          },
        ]}
      />
    );
  });

  const lightningTransform = flashOpacity.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {/* Lightning overlay for thunderstorms */}
      {isThunderstorm && (
        <>
          <Animated.View style={[styles.lightningFlash, { opacity: flashOpacity }]} />
          <View style={styles.lightningBolt1} />
          <View style={styles.lightningBolt2} />
        </>
      )}

      {/* Rain streaks */}
      {isRain && !isThunderstorm && (
        <View style={styles.rainsContainer}>
          {rainStreaks}
        </View>
      )}

      {/* Snowflakes with drift */}
      {isSnow && (
        <>
          <View style={styles.snowContainer}>
            {snowflakes}
          </View>
          <View style={styles.heavySnowLayer} />
        </>
      )}

      {/* Ambient storm effect for rain + thunder */}
      {isRain && isThunderstorm && (
        <View style={styles.stormAmbient} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  lightningFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    opacity: 0,
  },
  lightningBolt1: {
    position: 'absolute',
    width: 3,
    height: 120,
    backgroundColor: '#FDE68A',
    left: '20%',
    top: '10%',
    opacity: 0.5,
    transform: [{ rotate: '15deg' }],
    shadowColor: '#FDE68A',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  lightningBolt2: {
    position: 'absolute',
    width: 2,
    height: 100,
    backgroundColor: '#FDE68A',
    right: '15%',
    top: '20%',
    opacity: 0.4,
    transform: [{ rotate: '-12deg' }],
    shadowColor: '#FDE68A',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  rainsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  rainStreak: {
    position: 'absolute',
    width: 1.5,
    height: 25,
    backgroundColor: 'rgba(186,230,253,0.12)',
    opacity: 0.6,
  },
  snowContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  snowflake: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 4,
  },
  heavySnowLayer: {
    position: 'absolute',
    width: '100%',
    height: 60,
    backgroundColor: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 100%)',
    bottom: 0,
  },
  stormAmbient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
});

export default WeatherSceneEffect;
