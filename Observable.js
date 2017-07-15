function Observable(subscribe) {
    this._subscribe = subscribe;
}

Observable.prototype = {

    /**
     *
     * @param onNext
     * @param onError
     * @param onCompleted
     * @returns {*}
     */
    subscribe(onNext, onError = () => {}, onCompleted = () => {}) {
        if (typeof onNext === 'function') {
            return this._subscribe({
                onNext,
                onError,
                onCompleted
            });
        } else {
            return this._subscribe(onNext);
        }
    },

    /**
     *
     * @param projectionFunction
     * @returns {Observable}
     */
    map(projectionFunction) {
        return new Observable(observer => {
            const mapObserver = {
                onNext: (value) => {
                    try {
                        observer.onNext(projectionFunction(value))
                    } catch (error) {
                        observer.onError(error);
                    }
                },
                onError: (error) => observer.onError(error),
                onCompleted: () => observer.onCompleted()
            };

            return this.subscribe(mapObserver);
        });
    },

    /**
     *
     *
     * @param testFunction
     * @returns {Observable}
     */
    filter(testFunction) {
        return new Observable(observer => {
            const filterObserver = {
                onNext: (value) => {
                    if (testFunction(value)) {
                        observer.onNext(value);
                    }
                },
                onError: (error) => observer.onError(error),
                onCompleted: () => observer.onCompleted()
            };
            return this.subscribe(filterObserver);
        })
    },

    /**
     *
     * @param retryCount
     * @returns {Observable}
     */
    retry(retryCount = 3) {
        return new Observable(observer => {
            let counter = 0;
            let subscription = this.subscribe({
                onNext: (value) => {

                },
                onError: (error) => {
                    if (counter < num) {
                        return observer.onNext();
                    }
                    counter++;
                    observer.onError(error);
                },
                onCompleted: () => observer.onCompleted()
            });

            return subscription;
        });
    },

    concatAll(subArray) {

    },

    /**
     *
     * @param stopCollection
     * @returns {Observable}
     */
    takeUntil(stopCollection) {
        return new Observable(observer => {
            let subscription = this.subscribe({
                onNext: (value) => observer.onNext(value),
                onError: (error) => observer.onError(error),
                onCompleted: () => observer.onCompleted()
            });

            let stopSubscription = stopCollection.subscribe({
                onNext: () => {
                    observer.onCompleted();
                    subscription.dispose();

                    stopSubscription.dispose();
                }
            });

            return subscription;
        });
    },

    /**
     *
     * @param num
     * @returns {Observable}
     */
    take(num) {
        return new Observable(observer => {
            let counter = 0;
            let subscription = this.subscribe({
                onNext: (value) => {
                    observer.onNext(value);
                    counter++;

                    if (counter === num) {
                        observer.onCompleted();
                        subscription.dispose();
                    }
                },
                onError: (error) => observer.onError(error),
                onCompleted: () => observer.onCompleted()
            });

            return subscription;
        });
    }
};

/**
 *
 * @param dom
 * @param eventName
 * @returns {Observable}
 */
Observable.fromEvent = function (dom, eventName) {
    return new Observable(observer => {
        const handler = (event) => observer.onNext(event);

        dom.addEventListener(eventName, handler);

        return {
            dispose: () => {
                dom.removeEventListener(eventName, handler);
            }
        };
    });
};

Observable.fromPromise = function () {
    return new Observable(observer => {
        const timer = setInterval(() => {
            observer.onNext('test value');
        }, 500);

        return {
            dispose: () => {
                clearInterval(timer);
            }
        }
    });
};
