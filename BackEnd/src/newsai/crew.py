from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
import os
# If you want to run a snippet of code before or after the crew starts,
# you can use the @before_kickoff and @after_kickoff decorators
# https://docs.crewai.com/concepts/crews#example-crew-class-with-decorators

llm = LLM(
    model=os.getenv("MODEL"),
    api_key=os.getenv("GEMINI_API_KEY"),
)

@CrewBase
class Newsai():
    """Newsai crew"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def scraper(self) -> Agent:
        return Agent(
            config=self.agents_config['scraper'],
            verbose=True,
            llm=llm
        )

    # @agent
    # def reviewer(self) -> Agent:
    #     return Agent(
    #         config=self.agents_config['reviewer'],
    #         verbose=True,
    #         llm=llm
    #     )

    @task
    def scrape_content_task(self) -> Task:
        return Task(
            config=self.tasks_config['scrape_content_task'],
        )

    # @task
    # def review_content_task(self) -> Task:
    #     return Task(
    #         config=self.tasks_config['review_content_task'],
    #         output_file='report.md'
    #     )

    @crew
    def crew(self) -> Crew:
        """Creates the Newsai crew"""

        return Crew(
            agents=self.agents, # Automatically created by the @agent decorator
            tasks=self.tasks, # Automatically created by the @task decorator
            verbose=False
        )
