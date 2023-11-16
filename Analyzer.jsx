import React, {useRef, useState, useEffect} from 'react';
import styled from 'styled-components';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import axios from 'axios';

import crossing from '../assets/crossing.jpg'
let modelPromise;

const loadModel = async () => {
  if (!modelPromise) {
    modelPromise = cocoSsd.load();
  }
  return modelPromise;
};

function ObjectDetector({onUpdateSeeded}) {

  const fileInputRef = useRef();
  const [imgData, setImgData] = useState(null);
  const [photos, setPhotos] = useState([])
  const [query, setQuery] = useState('nyc')
  const inputRef = useRef();

  useEffect(() => {
    onUpdateSeeded([]);
    loadModel();
  }, []);

  useEffect (() => {
    axios.get(`http://localhost:3000/photos/all/${query}`)
    .then(res => {
      setPhotos(res.data.map(entry => entry.urls.regular))
      console.log('res data', res.data)
    })
    .catch(err => console.log('Failed loading photos from server', err))
  }, [query])



  const handleSubmit = (e) => {
    e.preventDefault();
    setQuery(inputRef.current.value);
  }


  const detectObjectsOnImage = async (imageElement) => {
    try {
        const model = await loadModel();
        const predictions = await model.detect(imageElement, 5);
        for (var j = 0; j < predictions.length; j++) {
          var found = predictions[j].class;
          console.log('classlog', found)
          if (found === 'car' ||
             found === 'bicycle' ||
             found === 'motorcycle' ||
             found === 'bus' ||
             found === 'train' ||
             found === 'truck' ||
             found === 'traffic light' ||
             found === 'fire hydrant' ||
             found === 'stop sign' ||
             found === 'parking meter' ||
             found === 'bench'
          ) {
            return true;
          }
        }
    } catch (error) {
        console.error("Error during object detection:", error);
    }
};

  const qualifiers = [];
  useEffect(() => {
    //IIFE structure
    for (var i = 0; i < photos.length; i++) {
      (function(index) {
          const imageElement = document.createElement('img');
          imageElement.src = photos[index];
          imageElement.crossOrigin = "Anonymous";
          imageElement.onload = async () => {
              const result = await detectObjectsOnImage(imageElement);
              if (result) {
                onUpdateSeeded(oldSeeded => [...oldSeeded, photos[index]]);
              }
          }
      })(i);
  }}, [photos])

  console.log('made it here')

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input ref={inputRef} type='text' className='findloc' placeholder="Location" />
        <button type="submit" className='searchbutton'>Send</button>
      </form>
    </div>
  )

};

export default ObjectDetector;