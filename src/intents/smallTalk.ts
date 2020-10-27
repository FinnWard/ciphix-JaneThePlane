// Intent name: Catchall smalltalk intent
import {
  helpCase,
  hobbiesCase,
  jokeCase,
  filmCase,
  foodCase,
  musicCase,
  meCase,
} from '../utilities';

export const smallTalk = (conv: any) => {
  const keyword: string = conv.parameters.context;

  // if we detect smalltalk without a detected keyword we respond generally
  if (!keyword) {
    return conv.add('Hah, thats a neat observation');
  }

  // Check keywords against predefined cases
  switch (keyword) {
    case 'help':
    case 'info':
    case 'information':
      return conv.add(helpCase());
    case 'hobbies':
    case 'hobby':
      return conv.add(hobbiesCase());
    case 'joke':
    case 'jokes':
    case 'funny':
      return conv.add(jokeCase());
    case 'movie':
    case 'movies':
    case 'film':
    case 'films':
      return conv.add(filmCase());
    case 'food':
      return conv.add(foodCase());
    case 'music':
    case 'song':
    case 'band':
      return conv.add(musicCase());
    case 'you':
    case 'yourself':
      return conv.add(meCase());
    default:
      // if we detect a subject but no defined case we bounce it back
      return conv.add(
        `Well, it seems you know quite a bit about ${conv.parameters.context}! Care to tell me a bit more about that?`,
      );
  }
};

export default smallTalk;
