import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router';
import { KEY } from '../config';
import DOMPurify from 'dompurify';

export const RecipePage = () => {
  const { recipeId, title } = useParams();
  const [info, setInfo] = useState();
  const [ingredients, setIngredients] = useState([]);
  const [dietary, setDietary] = useState([]);
  const [directions, setDirections] = useState();
  const [numServing, setNumServing] = useState();

  const fetchRecipeInfo = useCallback(async () => {
    try {
      const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${KEY}`);
      const recipeInfo = await response.json();
      const getRecipeInfo = {
        credits: recipeInfo.creditsText,
        healthScore: recipeInfo.healthScore,
        image: recipeInfo.image,
        time: recipeInfo.readyInMinutes,
        servingSize: recipeInfo.servings
      };

      const getIngredients = recipeInfo.extendedIngredients.map((item) => ({
        original: item.original.replace(/^[–-]\s*/, '').trim(),
        image: item.image
      }));
      const sanitiseInstructions = DOMPurify.sanitize(recipeInfo.instructions);
      const instructionArr = sanitiseInstructions
        .replaceAll(/(<([^>]+)>)/ig, '')
        .split('.')
        .filter(instruction => instruction.trim() !== '' && !/^\d+$/.test(instruction.trim()))
        .map(instruction => instruction.trim());
      instructionArr.pop();
      setDirections(instructionArr);
      setInfo(getRecipeInfo);
      setIngredients(getIngredients);
      setDietary(recipeInfo.diets);
      setNumServing(recipeInfo.servings);
    } catch (error) {
      console.log(error);
    }
  }, [recipeId]);

  useEffect(() => {
    fetchRecipeInfo();
  }, [fetchRecipeInfo]);

  return (
    <div className='flex flex-col mx-10'>
      {/* <div className='flex justify-end'>
      </div> */}
      <div className='flex justify-between items-center w-full'>
        {/* <div className='w-1/3'></div> */}
        <div className='text-3xl flex-grow text-center'>
          {title}
        </div>
      </div>
      {info &&
        <div>
          <div className='flex justify-center items-center my-5'>
            <img className='h-1/4 w-1/4 mr-5' src={info.image} alt={`${title} image`} />
            <div className='flex justify-center gap-3'>
              <div className='flex flex-col'>
                <div>
                  Health Score
                </div>
                <div>
                  {info.healthScore}
                </div>
              </div>
              <div className='flex flex-col'>
                <div>
                  Cooking Time
                </div>
                <div>
                  {info.time} {info.time < 2 ? 'min' : 'mins'}
                </div>
              </div>
              <div className='flex flex-col'>
                <div>
                  Serving Size
                </div>
                <div className='flex justify-evenly items-center'>
                  <div className='flex items-center h-full'>
                    <button
                      title='Add New'
                      className='group cursor-pointer outline-none h-full'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='30px'
                        height='30px'
                        viewBox='0 0 24 24'
                        className='stroke-zinc-400 fill-none hover:fill-slate-300'
                      >
                        <path
                          d='M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z'
                          stroke-width='1.5'
                        ></path>
                        <path d='M8 12H16' stroke-width='1.5'></path>
                        <path d='M12 16V8' stroke-width='1.5'></path>
                      </svg>
                    </button>
                  </div>
                  <div className='h-full text-2xl'>
                    {info.servingSize}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='ml-5'>
            <div className='flex text-xl'>Ingredients:</div>
            <div className='ml-5 w-1/2'>
              <ul className='list-disc'>
                {ingredients.map((item, id) => {
                  return (
                    <li className='text-left mb-2' key={id}>
                      {item.original}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className=' flex text-xl'>Instructions</div>
            <div className='ml-5 w-full'>
              <ol className='list-decimal'>
                {directions.map((instrct, id) => {
                  return (
                    <li key={id} className='text-left mb-2'>{instrct}</li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      }
    </div>
  )
}