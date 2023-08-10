import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import * as FaceDetector from "expo-face-detector";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import grinningImg from "./src/assets/grinning.png";
import neutralImg from "./src/assets/neutral.png";
import winkingImg from "./src/assets/winking.png";

export default function App() {
  const [faceDetected, setFaceDetected] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [emoji, setEmoji] = useState<ImageSourcePropType>(neutralImg);

  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    zIndex: 1,
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      { translateX: faceValues.value.x },
      { translateY: faceValues.value.y },
    ],
  }));

  function handleFacesDetected({ faces }: FaceDetectionResult) {
    const face = faces[0] as any;

    if (face) {
      const { size, origin } = face.bounds;

      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y,
      };

      setFaceDetected(true);

      if (face.smilingProbability > 0.5) {
        setEmoji(winkingImg);
      } else if (
        face.leftEyeOpenProbability > 0.5 &&
        face.rightEyeOpenProbability < 0.5
      ) {
        setEmoji(grinningImg);
      } else {
        setEmoji(neutralImg);
      }
    } else {
      setFaceDetected(false);
    }
  }

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission?.granted) {
    return;
  }

  return (
    <View style={styles.container}>
      {faceDetected && (
        <Animated.Image
          source={emoji}
          style={animatedStyle}
          resizeMode="contain"
        />
      )}
      <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  camera: {
    flex: 1,
  },
});
