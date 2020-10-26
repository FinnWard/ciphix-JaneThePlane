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

  if (!keyword) {
    return conv.add('hah, thats a neat observation');
  }

  switch (keyword) {
    case 'help':
      return conv.add(helpCase());
    case 'hobbies':
      return conv.add(hobbiesCase());
    case 'hobby':
      return conv.add(hobbiesCase());
    case 'info':
      return conv.add(helpCase());
    case 'information':
      return conv.add(helpCase());
    case 'joke':
      return conv.add(jokeCase());
    case 'jokes':
      return conv.add(jokeCase());
    case 'funny':
      return conv.add(jokeCase());
    case 'movie':
      return conv.add(filmCase());
    case 'movies':
      return conv.add(filmCase());
    case 'film':
      return conv.add(filmCase());
    case 'films':
      return conv.add(filmCase());
    case 'food':
      return conv.add(foodCase());
    case 'music':
      return conv.add(musicCase());
    case 'song':
      return conv.add(musicCase());
    case 'band':
      return conv.add(musicCase());
    case 'you':
      return conv.add(meCase());
    case 'yourself':
      return conv.add(meCase());
    default:
      return conv.add(
        `Well, it seems you know quite a bit about ${conv.parameters.any}! Care to tell me a bit more about that?`,
      );
  }
};

export default smallTalk;
