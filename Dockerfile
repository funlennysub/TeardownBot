# Built it
FROM mcr.microsoft.com/dotnet/sdk:5.0-alpine AS build

WORKDIR /Bot
COPY . ./
RUN dotnet restore

RUN dotnet publish ./TeardownBot/TeardownBot.csproj -c Release -o out

# Run it
FROM mcr.microsoft.com/dotnet/runtime:5.0-alpine

WORKDIR /Bot
COPY config.json .
COPY --from=build /Bot/out .

RUN chmod +x ./TeardownBot

CMD ["./TeardownBot"]