export function formSubmitOnEnterKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
        case "Enter": 
            e.preventDefault();
            (e.target as HTMLTextAreaElement).form?.requestSubmit();
    }
};
