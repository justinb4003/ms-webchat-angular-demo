﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
//
// Generated with CoreBot .NET Template version v4.17.1

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Logging;
using Microsoft.Recognizers.Text.DataTypes.TimexExpression;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace CoreBot.Dialogs
{
    public class MainDialog : ComponentDialog
    {
        private readonly ILogger _logger;

        // Dependency injection uses this constructor to instantiate MainDialog
        public MainDialog(ILogger<MainDialog> logger)
            : base(nameof(MainDialog))
        {
            _logger = logger;

            AddDialog(new TextPrompt(nameof(TextPrompt)));
            var waterfallSteps = new WaterfallStep[]
            {
                PromptNameAsync,
                HandleNameAsync,
                PromptAddressAsync,
                HandleAddressAsync,
                ResetDialogAsync,
            };

            AddDialog(new WaterfallDialog(nameof(WaterfallDialog), waterfallSteps));

            // The initial child Dialog to run.
            InitialDialogId = nameof(WaterfallDialog);
        }

        private async Task<ResourceResponse> SendUserData(ITurnContext ctx, CancellationToken cancellationToken, UserData data)
        {
            var jsonSerializerSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
                Formatting = Formatting.Indented,
                NullValueHandling = NullValueHandling.Ignore,
            };
            string jsonData = JsonConvert.SerializeObject(data, jsonSerializerSettings);
                        
            Activity act = new Activity
            {
                Type = ActivityTypes.Event,
                Name = "dataUpdate",
                Value = jsonData
            };
            return await ctx.SendActivityAsync(act, cancellationToken);

        }

        private async Task<DialogTurnResult> PromptNameAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            // Use the text provided in FinalStepAsync or the default if it is the first time.
            var messageText = stepContext.Options?.ToString() ?? "What is your name?";
            var promptMessage = MessageFactory.Text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions { Prompt = promptMessage }, cancellationToken);
        }

        private async Task<DialogTurnResult> HandleNameAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var fullName = stepContext.Result.ToString();
            var p = new UserData
            {
                PersonName = fullName
            };
            await SendUserData(stepContext.Context, cancellationToken, p);
            var message = $"Nice to meet you, {fullName}";
            var greetMessaage = MessageFactory.Text(message, message, InputHints.IgnoringInput);
            await stepContext.Context.SendActivityAsync(greetMessaage, cancellationToken);
            return await stepContext.NextAsync(null, cancellationToken);
        }
        
        private async Task<DialogTurnResult> PromptAddressAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            // Use the text provided in FinalStepAsync or the default if it is the first time.
            var messageText = stepContext.Options?.ToString() ?? "What is your address?";
            var promptMessage = MessageFactory.Text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions { Prompt = promptMessage }, cancellationToken);
        }

        private async Task<DialogTurnResult> HandleAddressAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var res = stepContext.Result.ToString();
            var p = new UserData
            {
                Address = res
            };
            await SendUserData(stepContext.Context, cancellationToken, p);
            var message = $"Thank you. I will record that in your file.";
            var greetMessaage = MessageFactory.Text(message, message, InputHints.IgnoringInput);
            await stepContext.Context.SendActivityAsync(greetMessaage, cancellationToken);
            return await stepContext.NextAsync(null, cancellationToken);
        }

        private async Task<DialogTurnResult> ResetDialogAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            // Restart the main dialog with a different message the second time around
            // Or just quit here?
            var promptMessage = "If I got your name wrong let me know and we can try again.";
            return await stepContext.ReplaceDialogAsync(InitialDialogId, promptMessage, cancellationToken);
        }
    }
}
