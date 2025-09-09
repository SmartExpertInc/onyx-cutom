"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, Video, FileQuestion } from "lucide-react";

const LearningObjectiveItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
    <p className="text-sm text-muted-foreground">{children}</p>
  </li>
);

const ResourceItem = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
    {icon}
    <p className="text-sm font-medium text-foreground">{children}</p>
  </div>
);

const PromptCard = ({ title, content }: { title: string; content: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm font-bold uppercase text-primary">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {content}
      </p>
    </CardContent>
  </Card>
);

export default function CourseContentPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-4xl py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px]">
          
          <div className="order-2 flex flex-col gap-8 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  In this lesson, learners will gain practical insights into the different types of organizational structures and their implications for company performance and employee dynamics. By understanding how to analyze and evaluate these structures, participants will be equipped to make informed decisions that enhance organizational effectiveness in real-world applications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <LearningObjectiveItem>
                    Identify and describe the key components of an organizational structure under various conditions, demonstrating understanding of different organizational models.
                  </LearningObjectiveItem>
                  <LearningObjectiveItem>
                    Analyze the impact of organizational structure on company performance and employee behavior resulting in insights for improvement strategies.
                  </LearningObjectiveItem>
                  <LearningObjectiveItem>
                    Evaluate real-world examples of organizational structures and their effectiveness, applying this knowledge to recommend appropriate structures for different business scenarios.
                  </LearningObjectiveItem>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ResourceItem icon={<FileText className="h-4 w-4 text-muted-foreground" />}>
                  Company_Org_Chart_Official_Q3_2025.pdf
                </ResourceItem>
                <ResourceItem icon={<FileText className="h-4 w-4 text-muted-foreground" />}>
                  Our_Business_Units_and_Divisions.docx
                </ResourceItem>
                <ResourceItem icon={<FileText className="h-4 w-4 text-muted-foreground" />}>
                  Leadership_Bios_and_Direct_Reports.pdf
                </ResourceItem>
                 <ResourceItem icon={<FileText className="h-4 w-4 text-muted-foreground" />}>
                  Employee_Handbook_Section_2_Our_Structure.pdf
                </ResourceItem>
              </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Content Creation Prompts</h2>
                <PromptCard
                    title="Presentation Creation Prompt:"
                    content="Create a professional presentation for new employees titled 'Understanding Organizational Structure.' The presentation's goal is to explain how a company's structure supports its strategy. It must cover the five main organizational structures (Functional, Divisional, Matrix, Flat, and Network), including their pros and cons. The presentation should also detail the key factors for choosing a structure, like business goals and culture, and conclude with a brief summary. Use a modern, corporate style with clear diagrams and a professional, engaging tone. The presentation should be 10-12 slides and must include concise on-slide text with detailed speaker notes for each slide."
                />
                 <PromptCard
                    title="Video Lesson Creation Prompt:"
                    content="Create a professional training video for new employees as part of their company onboarding. This lesson is titled 'Understanding Organizational Structure.' The video should welcome employees, explain that the main goal is to understand how businesses like ours are structured to achieve their goals, and provide a clear overview of the five most common organizational models: Functional, Divisional, Matrix, Flat, and Network. For each model, briefly explain how it works and mention a key advantage. The video must then emphasize the importance of aligning a company's structure with its strategic goals by touching upon the key considerations like culture and business objectives."
                />
                <PromptCard
                    title="Quiz Creation Prompt:"
                    content="Create a 5-question multiple-choice quiz for employees to complete after their onboarding lesson on 'Understanding Organizational Structure.' The quiz should assess their comprehension of the core concepts. Questions should cover the identification of different structures from a description, the primary advantages or disadvantages of specific models (e.g., silos in a functional structure, confusion in a matrix), and the ability to apply a key consideration to a simple scenario. The questions should be clear and direct, with one correct answer and three plausible but incorrect distractors. For each question, please provide the correct answer and a brief rationale explaining why it is correct."
                />
            </div>

          </div>

          <aside className="order-1 lg:order-2">
            <div className="sticky top-8 flex flex-col gap-8">
                <Card className="overflow-hidden">
                    <div className="relative h-48 w-full">
                        <Image src="https://ui.shadcn.com/placeholder.svg" alt="Organizational Structure" fill className="object-cover" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl">Organizational Structure</CardTitle>
                        <CardDescription>Creation time: 200h Completion time: 8m</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Content Types</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground"><path d="M4 4v16h16V4Z"/><path d="M9 4v16"/><path d="M15 4v16"/><path d="M4 9h16"/><path d="M4 15h16"/></svg>
                                <h3 className="font-semibold">Presentation Draft</h3>
                            </div>
                            <div className="relative">
                                <Image src="https://ui.shadcn.com/placeholder.svg" alt="Slide 1" width={400} height={225} className="w-full rounded-lg border" />
                                <div className="absolute inset-0 flex items-center justify-between px-2">
                                    <Button variant="outline" size="icon" className="rounded-full bg-background/50 hover:bg-background/80">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="rounded-full bg-background/50 hover:bg-background/80">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <p className="mt-2 text-center text-sm font-semibold text-muted-foreground">Slide 1</p>
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-4">
                                <Video className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">Video Lesson Draft</h3>
                            </div>
                             <div className="relative aspect-video w-full">
                                <Image src="https://ui.shadcn.com/placeholder.svg" alt="Video thumbnail" fill className="rounded-lg border object-cover" />
                             </div>
                        </div>
                        <div>
                             <div className="flex items-center gap-3 mb-4">
                                <FileQuestion className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">Quiz Draft</h3>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <Button variant="ghost" size="icon">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <p className="text-sm font-semibold">Question 1</p>
                                <Button variant="ghost" size="icon">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
