import { SubtitleStyles } from "@/lib/db/schema";

export const defaultSubtitleStyles = {
    fontSize: 16,
    fontFamily: "Arial",
    textShadow: 'outline' as SubtitleStyles['textShadow'],
    textColor: "#FFFFFF",
    textOpacity: 1,
    backgroundColor: "#000000",
    backgroundOpacity: 0,
    backgroundBlur: 0,
    backgroundRadius: 6,
    transcription: "all" as SubtitleStyles['transcription'],
};

// Define text shadow types
export const textShadowTypes = [
    "none",
    "drop-shadow",
    "raised",
    "depressed",
    "outline"
] as const;

export const fontFamilies = [
    "Arial",
    "Helvetica",
    "Georgia",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Tahoma",
    "Trebuchet MS",
    "Lucida Console",
    "Comic Sans MS",
    "Fira Code",
    "JetBrains Mono",
    "Roboto",
    "Open Sans",
    "Inter",
    "Source Sans Pro",
    "Poppins",
    "Lato",
    "Nunito",
    "Montserrat",
];