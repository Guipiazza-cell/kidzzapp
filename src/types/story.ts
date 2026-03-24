export interface ChildAvatar {
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  clothingStyle: string;
}

export interface StoryConfig {
  childName: string;
  age: number;
  interests: string;
  avatar: ChildAvatar;
}
