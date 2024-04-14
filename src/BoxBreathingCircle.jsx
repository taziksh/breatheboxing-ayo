import React, { useState, useRef, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { Sampler } from "tone";
import A1 from "../meditation2min.mp3";
import "./App.css";

//TODO: falling sakura petals animation https://codepen.io/nicecue/pen/gOpppqE

const Wisp = ({ top, left }) => {
    return (
        <div className="wisp" style={{ top, left }}></div>
    );
};

// Credits: https://discourse.webflow.com/t/add-falling-confetti-with-css/103687/2
const Confetti = () => {
  return (
    <div className="container">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className={`confetti`}></div>
      ))}
    </div>
  );
};

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
    } else {
      setTimeout(() => sampler.current.triggerRelease(), 0);
    }
  }, [play]);

  return null;
};


const BoxBreathingCircle = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [playAudio, setPlayAudio] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("inhaling");
  const [textOpacity, setTextOpacity] = useState(1);
  const circleRef = useRef();
  const textRef = useRef();

  const [textPosition, setTextPosition] = useSpring(() => ({
    left: '50%', 
    top: '50%',
    config: { tension: 280, friction: 60 }
  }));

  //TODO: enable wisps
  const wispCoords = [
      // { top: '20%', left: '30%' },
      // { top: '50%', left: '70%' },
      // { top: '80%', left: '10%' },
  ];

  const { radius } = useSpring({
    radius: isHovered ? 100 : 50,
    from: { radius: 50 },
    config: { duration: 4000 },
    loop: { reverse: true },
    onRest: () => {
      const nextPhase = breathingPhase === "inhaling" ? "exhaling" : "inhaling";
      setBreathingPhase(nextPhase);

      // Update text position on phase change
      setTextPosition.start({
        left: `${10 + Math.random() * 80}%`,
        top: `${10 + Math.random() * 80}%`,
        config: { mass: 0.5, tension: 170, friction: 100 } 
      });
    },
  });


  const [{ x, y }, setPosition] = useSpring(() => ({ x: 0, y: 0 }));

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleMouseMove = (event) => {
    setPosition.start({
      x: event.clientX - 100,
      y: event.clientY - 100,
      immediate: false,
      config: { duration: 500 },
    });

    const { clientX, clientY } = event;
    const circleCenter = getCircleCenter();
    const distance = Math.sqrt(
      (circleCenter.x - clientX) ** 2 + (circleCenter.y - clientY) ** 2,
    );
    const isInvisibleCircleRadius = 300;

    setPlayAudio(distance <= isInvisibleCircleRadius);

    if (textRef.current) {
      // Calculate the distance between the mouse and the text element's center
      const textRect = textRef.current.getBoundingClientRect();
      const textCenterX = textRect.left + textRect.width / 2;
      const textCenterY = textRect.top + textRect.height / 2;
      const distance = Math.sqrt(
        (textCenterX - event.clientX) ** 2 + (textCenterY - event.clientY) ** 2,
      );

      // Adjust opacity based on the distance
      const maxDistance = 5;
      const opacity = Math.min(1, Math.max(0, 1 - distance / maxDistance));

      setTextOpacity(opacity);
    }
  };

  const getCircleCenter = () => {
    if (!circleRef.current) return { x: 0, y: 0 };
    const rect = circleRef.current.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

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
      <div>
        <Confetti />
      </div>
      <div>
          {wispCoords.map((position, index) => (
              <Wisp key={index} top={position.top} left={position.left} />
          ))}
      </div>
      <animated.div
        ref={textRef}
        className={breathingPhase == "inhaling" ? "textExpand" : "textContract"}
        style={{
          position: "fixed",
          top: "10%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: -1, // Ensure text is behind the circle
          opacity: textOpacity, 
          transition: "opacity 0.5s ease",
          fontSize: "64px",
          fontFamily: "'EB Garamond', serif", 
          ...textPosition
        }}
      >
        {breathingPhase === "inhaling" ? "Breathe in" : "Breathe out"}
      </animated.div>
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
          x,
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
