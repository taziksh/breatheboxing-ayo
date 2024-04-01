import React, { useState, useRef, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { Sampler } from "tone";
import A1 from "../meditation2min.mp3";

export const Player = ({ play }) => {
  const sampler = useRef(null);

  useEffect(() => {
    sampler.current = new Sampler(
      { A1 },
      {
        onload: () => {},
      },
    ).toMaster();
  }, []);

  useEffect(() => {
    if (play) {
      if (!sampler.current.isPlaying) {
        sampler.current.triggerAttack("A1");
      }
      // volume.current.fadeIn(0.5); // Fade in over 0.5 seconds
    } else {
      // const fadeOutTime = 0.5;
      // volume.current.fadeOut(0.5); // Fade out over 0.5 seconds
      setTimeout(() => sampler.current.triggerRelease(), 0); // Ensure timeout matches the fade out duration
    }
  }, [play]);

  return null;
};

const BoxBreathingCircle = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [playAudio, setPlayAudio] = useState(false);
  const circleRef = useRef();

  // Animation for the circle's radius
  const { radius } = useSpring({
    radius: isHovered ? 100 : 50, // Full size and start size
    from: { radius: 50 },
    config: { duration: 4000 },
    loop: { reverse: true },
  });

  // New: Spring animation for the circle's position
  const [{ x, y }, setPosition] = useSpring(() => ({ x: 0, y: 0 }));

  // Event handlers
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // Update position based on cursor movement, with a delay
  const handleMouseMove = (event) => {
    setPosition.start({
      x: event.clientX - 100, // Centering the circle based on its size
      y: event.clientY - 100,
      immediate: false,
      config: { duration: 500 }, // This creates the lag effect
    });

    const { clientX, clientY } = event;
    const { x, y } = getCircleCenter();
    const distance = Math.sqrt((x - clientX) ** 2 + (y - clientY) ** 2);
    const isInvisibleCircleRadius = 300; //

    setPlayAudio(distance <= isInvisibleCircleRadius);
  };

  const getCircleCenter = () => {
    if (!circleRef.current) return { x: 0, y: 0 };
    const rect = circleRef.current.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  // Bind event listeners
  useEffect(() => {
    const circle = circleRef.current;
    if (circle) {
      circle.addEventListener("mouseenter", handleMouseEnter);
      circle.addEventListener("mouseleave", handleMouseLeave);
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (circle) {
        circle.removeEventListener("mouseenter", handleMouseEnter);
        circle.removeEventListener("mouseleave", handleMouseLeave);
      }
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <animated.div
        style={{
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          border: "5px solid lightblue",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "20px auto",
          position: "fixed",
          x, // Directly apply the animated values
          y,
          willChange: "x, y",
        }}
      >
        <animated.div
          ref={circleRef}
          style={{
            width: radius.to((r) => `${2 * r}px`),
            height: radius.to((r) => `${2 * r}px`),
            borderRadius: "50%",
            background: "blue",
            willChange: "width, height",
          }}
        />
      </animated.div>
      <Player play={playAudio} />
    </>
  );
};

export default BoxBreathingCircle;
